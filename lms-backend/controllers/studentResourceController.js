import pool from '../config/db.js';

const getClassResources = async (req, res) => {
  const { class_id } = req.params;
  const studentId = req.body.userId;

  try {
    // Verify student is enrolled and payment is complete
    const [enrollment] = await pool.query(
      `SELECT id FROM student_enrollments 
       WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
      [studentId, class_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled or payment not completed' 
      });
    }

    // Get all resources in parallel
    const [assignments] = await pool.query(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM assignment_submissions 
        WHERE assignment_id = a.id AND student_id = ?) as submitted
       FROM assignments a 
       WHERE a.class_id = ?`, 
      [studentId, class_id]
    );
    
    // Get all questions (all types) for the class
    const [questions] = await pool.query(
      `SELECT q.*, 
       (SELECT COUNT(*) FROM quiz_attempts 
        WHERE quiz_id = q.id AND student_id = ?) as attempted
       FROM questions q 
       WHERE q.class_id = ?`, 
      [studentId, class_id]
    );
    
    const [pastPapers] = await pool.query(
      'SELECT * FROM past_papers WHERE class_id = ?', 
      [class_id]
    );
    
    const [videos] = await pool.query(
      'SELECT * FROM videos WHERE class_id = ?', 
      [class_id]
    );

    // Get questions and options for each assignment
    for (const assignment of assignments) {
      const [assignmentQuestions] = await pool.query(
        `SELECT q.*, aq.points as assignment_points
         FROM assignment_questions aq
         JOIN questions q ON aq.question_id = q.id
         WHERE aq.assignment_id = ?`,
        [assignment.id]
      );
      
      // Get options for each question (only for multiple_choice)
      for (const question of assignmentQuestions) {
        if (question.question_type === 'multiple_choice') {
          const [options] = await pool.query(
            'SELECT * FROM question_options WHERE question_id = ?',
            [question.id]
          );
          question.options = options;
        }
      }
      
      assignment.questions = assignmentQuestions;
    }

    // Separate questions by type for the response
    const quizzes = questions.filter(q => q.question_type === 'multiple_choice');
    const shortAnswerQuestions = questions.filter(q => q.question_type === 'short_answer');
    const essayQuestions = questions.filter(q => q.question_type === 'essay');

    // Get options for each quiz (multiple_choice questions)
    for (const quiz of quizzes) {
      const [options] = await pool.query(
        'SELECT * FROM question_options WHERE question_id = ?',
        [quiz.id]
      );
      quiz.options = options;
    }

    res.json({
      success: true,
      resources: {
        assignments,
        quizzes,
        short_answer_questions: shortAnswerQuestions,
        essay_questions: essayQuestions,
        past_papers: pastPapers,
        videos
      }
    });
  } catch (error) {
    console.error('Error fetching class resources:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching class resources' 
    });
  }
};

/**
 * Submit an assignment
 */ 

export const submitAssignment = async (req, res) => {
    try {
        const studentId = req.body.userId;
        const { assignment_id, answers } = req.body;
        let documentUrl = null;

        // Handle file upload if exists
        if (req.file) {
            documentUrl = `/uploads/${req.file.filename}`;
        }

        // Parse answers if coming as string (from FormData)
        const parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;

        // Verify assignment exists and get class_id
        const [assignment] = await pool.query(
            'SELECT class_id FROM assignments WHERE id = ?',
            [assignment_id]
        );

        if (assignment.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found'
            });
        }

        const class_id = assignment[0].class_id;

        // Verify student is enrolled and payment is complete
        const [enrollment] = await pool.query(
            `SELECT id FROM student_enrollments 
             WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
            [studentId, class_id]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Not enrolled or payment not completed'
            });
        }

        // Check if already submitted
        const [existingSubmission] = await pool.query(
            'SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?',
            [assignment_id, studentId]
        );

        if (existingSubmission.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Already submitted this assignment'
            });
        }

        // Create submission with pending status
        const [result] = await pool.query(
            `INSERT INTO assignment_submissions 
              (assignment_id, student_id, grade, document_url, status)
             VALUES (?, ?, ?, ?, ?)`,
            [assignment_id, studentId, null, documentUrl, 'pending'] // Set grade to null and status to pending
        );

        // Store individual answers
        for (const answer of parsedAnswers) {
            await pool.query(
                `INSERT INTO assignment_answers 
                  (submission_id, question_id, answer_text, option_id, document_url)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    result.insertId,
                    answer.question_id,
                    answer.answer_text || null,
                    answer.option_id || null,
                    documentUrl || null
                ]
            );
        }

        res.status(201).json({
            success: true,
            submission: {
                id: result.insertId,
                assignment_id,
                student_id: studentId,
                score: null, // No score yet
                status: 'pending', // Include status in response
                document_url: documentUrl
            }
        });

    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting assignment',
            error: error.message
        });
    }
};
/**
 * Attempt a quiz (multiple choice questions)
 */
const attemptQuiz = async (req, res) => {
  const { quiz_id, answers } = req.body;
  const studentId = req.body.userId;

  try {
    // Verify quiz exists and get class_id
    const [quiz] = await pool.query(
      `SELECT class_id, points FROM questions 
       WHERE id = ? AND question_type = 'multiple_choice'`,
      [quiz_id]
    );

    if (quiz.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quiz not found or not a valid quiz' 
      });
    }

    const class_id = quiz[0].class_id;
    const quizPoints = quiz[0].points || 1;

    // Verify student is enrolled
    const [enrollment] = await pool.query(
      `SELECT id FROM student_enrollments 
       WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
      [studentId, class_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled or payment not completed' 
      });
    }

    // Check if already attempted
    const [existingAttempt] = await pool.query(
      'SELECT id FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?',
      [quiz_id, studentId]
    );

    if (existingAttempt.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already attempted this quiz' 
      });
    }

    // Get correct answers
    const [correctOptions] = await pool.query(
      'SELECT id FROM question_options WHERE question_id = ? AND is_correct = 1',
      [quiz_id]
    );

    // Check if answer is correct
    const isCorrect = correctOptions.some(option => 
      option.id === answers[0].option_id
    );

    const score = isCorrect ? quizPoints : 0;

    // Record attempt
    const [result] = await pool.query(
      `INSERT INTO quiz_attempts 
        (quiz_id, student_id, score)
       VALUES (?, ?, ?)`,
      [quiz_id, studentId, score]
    );

    res.status(201).json({
      success: true,
      attempt: {
        id: result.insertId,
        quiz_id,
        student_id: studentId,
        score,
        is_correct: isCorrect
      }
    });
  } catch (error) {
    console.error('Error attempting quiz:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error attempting quiz' 
    });
  }
};
// Get a single question with options
export const getQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    // Get question
    const [question] = await pool.query(
      'SELECT * FROM questions WHERE id = ?',
      [questionId]
    );

    if (question.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found' 
      });
    }

    // Get options if multiple choice
    let options = [];
    if (question[0].question_type === 'multiple_choice') {
      [options] = await pool.query(
        'SELECT * FROM question_options WHERE question_id = ?',
        [questionId]
      );
    }

    res.json({
      success: true,
      question: {
        ...question[0],
        options
      }
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching question' 
    });
  }
};

// Get questions for a specific assignment
export const getAssignmentQuestions = async (req, res) => {
  const { assignmentId } = req.params;

  try {
    const [questions] = await pool.query(
      `SELECT q.*, aq.points as assignment_points
       FROM assignment_questions aq
       JOIN questions q ON aq.question_id = q.id
       WHERE aq.assignment_id = ?`,
      [assignmentId]
    );

    // Get options for each multiple choice question
    for (const question of questions) {
      if (question.question_type === 'multiple_choice') {
        const [options] = await pool.query(
          'SELECT * FROM question_options WHERE question_id = ?',
          [question.id]
        );
        question.options = options;
      }
    }

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error fetching assignment questions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignment questions' 
    });
  }
};

// Submit short answer or essay question
export const submitQuestionAnswer = async (req, res) => {
  const { questionId } = req.params;
  const { userId, answer_text } = req.body; // Get both fields from body

  try {
    // Verify question exists and is correct type
    const [question] = await pool.query(
      'SELECT id, class_id, question_type, points FROM questions WHERE id = ? AND question_type IN ("short_answer", "essay")',
      [questionId]
    );

    if (question.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found or invalid type' 
      });
    }

    // Verify student is enrolled
    const [enrollment] = await pool.query(
      `SELECT id FROM student_enrollments 
       WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
      [userId, question[0].class_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled or payment not completed' 
      });
    }

    // Check for existing answer
    const [existingAnswer] = await pool.query(
      `SELECT id, status FROM question_answers 
       WHERE question_id = ? AND student_id = ?`,
      [questionId, userId]
    );

    if (existingAnswer.length > 0) {
      // Prevent re-submission if already graded
      if (existingAnswer[0].status === 'graded') {
        return res.status(400).json({ 
          success: false, 
          message: 'Answer already graded - cannot resubmit' 
        });
      }
      
      // Update existing answer
      await pool.query(
        `UPDATE question_answers 
         SET answer_text = ?,
             status = 'pending',
             updated_at = NOW()
         WHERE id = ?`,
        [answer_text, existingAnswer[0].id]
      );
    } else {
      // Create new answer with pending status
      await pool.query(
        `INSERT INTO question_answers 
         (question_id, student_id, answer_text, status)
         VALUES (?, ?, ?, 'pending')`,
        [questionId, userId, answer_text]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully. Waiting for teacher evaluation.'
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting answer',
      error: error.message 
    });
  }
};
/**
 * Get a single assignment with details
 */
export const getAssignment = async (req, res) => {
  const { assignmentId } = req.params;
  const studentId = req.body.userId;

  try {
    // Verify assignment exists
    const [assignment] = await pool.query(
      `SELECT a.*, 
       (SELECT COUNT(*) FROM assignment_submissions 
        WHERE assignment_id = a.id AND student_id = ?) as submitted
       FROM assignments a 
       WHERE a.id = ?`,
      [studentId, assignmentId]
    );

    if (assignment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Assignment not found' 
      });
    }

    // Verify student is enrolled in the class
    const [enrollment] = await pool.query(
      `SELECT id FROM student_enrollments 
       WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
      [studentId, assignment[0].class_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled or payment not completed' 
      });
    }

    // Get the assignment details
    const assignmentDetails = assignment[0];

    res.json({
      success: true,
      assignment: assignmentDetails
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignment' 
    });
  }
};
// Add this to your backend controller file (where you have other question-related functions)

/**
 * Get question details for viewing
 */
export const viewQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { questionType } = req.query;
  const studentId = req.body.userId;

  try {
    // Verify question exists and matches type
    const [question] = await pool.query(
      'SELECT id, class_id, question_text, points, question_type FROM questions WHERE id = ? AND question_type IN ("short_answer", "essay")',
      [questionId]
    );

    if (question.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Question not found or invalid type' 
      });
    }

    // Verify student is enrolled
    const [enrollment] = await pool.query(
      `SELECT id FROM student_enrollments 
       WHERE student_id = ? AND class_id = ? AND payment_status = 'completed'`,
      [studentId, question[0].class_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled or payment not completed' 
      });
    }

    // Check for existing answer
    const [existingAnswer] = await pool.query(
      `SELECT answer_text, document_url, marks, status, feedback 
       FROM question_answers 
       WHERE question_id = ? AND student_id = ?`,
      [questionId, studentId]
    );

    res.json({
      success: true,
      question: {
        id: question[0].id,
        question_text: question[0].question_text,
        points: question[0].points,
        type: question[0].question_type,
        answer: existingAnswer.length > 0 ? {
          text: existingAnswer[0].answer_text,
          document_url: existingAnswer[0].document_url,
          marks: existingAnswer[0].marks,
          status: existingAnswer[0].status,
          feedback: existingAnswer[0].feedback
        } : null
      }
    });

  } catch (error) {
    console.error('Error viewing question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error viewing question',
      error: error.message 
    });
  }
};
export {
  getClassResources,
  attemptQuiz

};