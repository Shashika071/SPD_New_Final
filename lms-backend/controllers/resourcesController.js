import pool from '../config/db.js';

/**
 * @typedef {Object} Question
 * @property {string} question_text
 * @property {string} question_type
 * @property {number} points
 * @property {Array<{option_text: string, is_correct: boolean}>} [options]
 */

/**
 * Add a new question to a class
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const addQuestion = async (req, res) => {
  const { 
    class_id, 
    question_text, 
    question_type, 
    points, 
    options, 
    due_date,  // New field for due date
    time_limit // New field for time limit (in minutes)
  } = req.body;
  const teacherId = req.body.userId;

  // Validate due_date if provided
  if (due_date && isNaN(new Date(due_date).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid due date format'
    });
  }

  // Validate time_limit for multiple choice questions
  if (question_type === 'multiple_choice' && time_limit === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Time limit is required for multiple choice questions'
    });
  }

  if (question_type === 'multiple_choice' && (isNaN(time_limit) || time_limit <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Time limit must be a positive number (minutes)'
    });
  }

  try {
    await pool.query('START TRANSACTION');

    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [class_id, teacherId]);

    if (verifyResult.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to add questions to this class' 
      });
    }

    // Insert the question with due_date
    const INSERT_QUESTION_QUERY = `
      INSERT INTO questions 
        (class_id, question_text, question_type, points, due_date, time_limit)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [questionResult] = await pool.query(INSERT_QUESTION_QUERY, [
      class_id, 
      question_text, 
      question_type, 
      points || 1,
      due_date || null,  // Store due_date (null if not provided)
      question_type === 'multiple_choice' ? time_limit : null  // Only store time_limit for MC questions
    ]);

    const questionId = questionResult.insertId;

    // Insert options if this is a multiple choice question
    if (question_type === 'multiple_choice' && options && options.length > 0) {
      for (const option of options) {
        const INSERT_OPTION_QUERY = `
          INSERT INTO question_options (question_id, option_text, is_correct)
          VALUES (?, ?, ?)
        `;
        await pool.query(INSERT_OPTION_QUERY, [
          questionId, option.option_text, option.is_correct || false
        ]);
      }
    }

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      question: {
        id: questionId,
        class_id,
        question_text,
        question_type,
        points: points || 1,
        due_date: due_date || null,
        time_limit: question_type === 'multiple_choice' ? time_limit : null
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error adding question:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding question' 
    });
  }
};
/**
 * Create a new assignment
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createAssignment = async (req, res) => {
  const { class_id, title, description, due_date, total_points, questions } = req.body;
  const teacherId = req.body.userId;

  try {
    await pool.query('START TRANSACTION');

    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [class_id, teacherId]);

    if (verifyResult.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to create assignments for this class' 
      });
    }

    // Insert the assignment
    const INSERT_ASSIGNMENT_QUERY = `
      INSERT INTO assignments (class_id, title, description, due_date, total_points)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [assignmentResult] = await pool.query(INSERT_ASSIGNMENT_QUERY, [
      class_id, title, description || null, due_date || null, total_points || 100
    ]);

    const assignmentId = assignmentResult.insertId;

    // Create new questions and link to assignment
    if (questions && questions.length > 0) {
      for (const question of questions) {
        // Insert new question
        const INSERT_QUESTION_QUERY = `
          INSERT INTO questions (class_id, question_text, question_type, points)
          VALUES (?, ?, ?, ?)
        `;
        const [questionResult] = await pool.query(INSERT_QUESTION_QUERY, [
          class_id, 
          question.question_text, 
          question.question_type || 'short_answer', 
          question.points || 1
        ]);
        
        const questionId = questionResult.insertId;
        
        // If multiple choice, insert options
        if (question.question_type === 'multiple_choice' && question.options) {
          for (const option of question.options) {
            const INSERT_OPTION_QUERY = `
              INSERT INTO question_options (question_id, option_text, is_correct)
              VALUES (?, ?, ?)
            `;
            await pool.query(INSERT_OPTION_QUERY, [
              questionId,
              option.option_text,
              option.is_correct || false
            ]);
          }
        }

        // Link question to assignment
        const LINK_QUESTION_QUERY = `
          INSERT INTO assignment_questions (assignment_id, question_id, points)
          VALUES (?, ?, ?)
        `;
        await pool.query(LINK_QUESTION_QUERY, [
          assignmentId, 
          questionId, 
          question.points || 1
        ]);
      }
    }

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      assignment: {
        id: assignmentId,
        class_id,
        title,
        description,
        due_date,
        total_points: total_points || 100
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating assignment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating assignment' 
    });
  }
};
/**
 * Add a past paper
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const addPastPaper = async (req, res) => {
  const { class_id, title, description, year, paper_url } = req.body;
  const teacherId = req.body.userId;

  try {
    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [class_id, teacherId]);

    if (verifyResult.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to add past papers to this class' 
      });
    }

    // Insert the past paper
    const INSERT_PAST_PAPER_QUERY = `
      INSERT INTO past_papers (class_id, title, description, year, paper_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(INSERT_PAST_PAPER_QUERY, [
      class_id, title, description || null, year || null, paper_url
    ]);

    res.status(201).json({
      success: true,
      past_paper: {
        id: result.insertId,
        class_id,
        title,
        description,
        year,
        paper_url
      }
    });
  } catch (error) {
    console.error('Error adding past paper:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding past paper' 
    });
  }
};

/**
 * Add a video resource
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const addVideo = async (req, res) => {
  const { class_id, title, description, video_url} = req.body;
  const teacherId = req.body.userId;

  try {
    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [class_id, teacherId]);

    if (verifyResult.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to add videos to this class' 
      });
    }

    // Insert the video
    const INSERT_VIDEO_QUERY = `
      INSERT INTO videos (class_id, title, description, video_url)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(INSERT_VIDEO_QUERY, [
      class_id, title, description || null, video_url
    ]);

    res.status(201).json({
      success: true,
      video: {
        id: result.insertId,
        class_id,
        title,
        description,
        video_url,
      
      }
    });
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding video' 
    });
  }
};

/**
 * Get all resources for a class
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getClassResource = async (req, res) => {
  const { class_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [class_id, teacherId]);

    if (verifyResult.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view resources for this class' 
      });
    }

    // Get all resources in parallel
    const [questions] = await pool.query(
      'SELECT id, class_id, question_text, question_type, points, due_date, time_limit FROM questions WHERE class_id = ?', 
      [class_id]
    );
    
    // For multiple choice questions, fetch their options
    const mcQuestions = questions.filter(q => q.question_type === 'multiple_choice');
    for (const question of mcQuestions) {
      const [options] = await pool.query(
        'SELECT id, option_text, is_correct FROM question_options WHERE question_id = ?',
        [question.id]
      );
      question.options = options;
    }

    const [assignments] = await pool.query(
      'SELECT * FROM assignments WHERE class_id = ?', 
      [class_id]
    );
    const [pastPapers] = await pool.query(
      'SELECT * FROM past_papers WHERE class_id = ?', 
      [class_id]
    );
    const [videos] = await pool.query(
      'SELECT * FROM videos WHERE class_id = ?', 
      [class_id]
    );

    // Get questions for each assignment (including the new fields)
    for (const assignment of assignments) {
      const [assignmentQuestions] = await pool.query(`
        SELECT q.*, aq.points as assignment_points
        FROM assignment_questions aq
        JOIN questions q ON aq.question_id = q.id
        WHERE aq.assignment_id = ?
      `, [assignment.id]);
      
      // Add options to multiple choice questions in assignments
      for (const question of assignmentQuestions) {
        if (question.question_type === 'multiple_choice') {
          const [options] = await pool.query(
            'SELECT id, option_text, is_correct FROM question_options WHERE question_id = ?',
            [question.id]
          );
          question.options = options;
        }
      }
      
      assignment.questions = assignmentQuestions;
    }

    res.json({
      success: true,
      resources: {
        questions,
        assignments,
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
const deleteQuestion = async (req, res) => {
  const { question_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Get class_id of this question to verify ownership
    const [result] = await pool.query(
      'SELECT class_id FROM questions WHERE id = ?',
      [question_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const class_id = result[0].class_id;

    // Verify teacher owns the class
    const [verify] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, teacherId]
    );
    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this question' });
    }

    // Delete the question (cascade deletes options etc. if FK constraints are set)
    await pool.query('DELETE FROM questions WHERE id = ?', [question_id]);

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ success: false, message: 'Error deleting question' });
  }
};
const deleteAssignment = async (req, res) => {
  const { assignment_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Get class_id of this assignment to verify ownership
    const [result] = await pool.query(
      'SELECT class_id FROM assignments WHERE id = ?',
      [assignment_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const class_id = result[0].class_id;

    // Verify teacher owns the class
    const [verify] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, teacherId]
    );
    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
    }

    // Delete assignment (cascades assignment_questions, submissions, etc.)
    await pool.query('DELETE FROM assignments WHERE id = ?', [assignment_id]);

    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, message: 'Error deleting assignment' });
  }
};

const deletePastPaper = async (req, res) => {
  const { past_paper_id } = req.body;
  const teacherId = req.body.userId;

 
  try {
    // Get class_id of this past paper to verify ownership
    const [result] = await pool.query(
      'SELECT class_id FROM past_papers WHERE id = ?',
      [past_paper_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Past paper not found' });
    }

    const class_id = result[0].class_id;

    // Verify teacher owns the class
    const [verify] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, teacherId]
    );

    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this past paper' });
    }

    // Delete the past paper
    await pool.query('DELETE FROM past_papers WHERE id = ?', [past_paper_id]);

    res.json({ success: true, message: 'Past paper deleted successfully' });
  } catch (error) {
    console.error('Error deleting past paper:', error);
    res.status(500).json({ success: false, message: 'Error deleting past paper' });
  }
};
const deleteVideo = async (req, res) => {
  const { video_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Get class_id of this video to verify ownership
    const [result] = await pool.query(
      'SELECT class_id FROM videos WHERE id = ?',
      [video_id]
    );

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const class_id = result[0].class_id;

    // Verify teacher owns the class
    const [verify] = await pool.query(
      'SELECT id FROM classes WHERE id = ? AND teacher_id = ?',
      [class_id, teacherId]
    );
    if (verify.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this video' });
    }

    await pool.query('DELETE FROM videos WHERE id = ?', [video_id]);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Error deleting video' });
  }
};
/**
 * Get all students enrolled in teacher's classes
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getTeacherStudents = async (req, res) => {
  const teacherId = req.body.userId;

  try {
    // Get all classes taught by this teacher
    const [classes] = await pool.query(
      'SELECT id FROM classes WHERE teacher_id = ?',
      [teacherId]
    );

    if (classes.length === 0) {
      return res.json({
        success: true,
        students: []
      });
    }

    const classIds = classes.map(c => c.id);

    // Get all students enrolled in these classes
    const [enrollments] = await pool.query(`
      SELECT s.student_id, s.student_name, s.email, s.phone, 
             s.parent_phone, s.profile_image,
             se.class_id, c.class_name, c.subject, c.grade,
             se.enrollment_date, se.payment_status
      FROM student_enrollments se
      JOIN students s ON se.student_id = s.student_id
      JOIN classes c ON se.class_id = c.id
      WHERE se.class_id IN (?)
      ORDER BY s.student_name ASC
    `, [classIds]);

    res.json({
      success: true,
      students: enrollments
    });
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students'
    });
  }
};

/**
 * Update student assignment submission (status, marks, feedback)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateStudentSubmission = async (req, res) => {
  const {  grade, feedback, status } = req.body;
  const teacherId = req.body.userId;
  const { submission_id } = req.params;
  try {
    // Verify the teacher has permission to grade this submission
    const [verify] = await pool.query(`
      SELECT a.id 
      FROM assignment_submissions asub
      JOIN assignments a ON asub.assignment_id = a.id
      JOIN classes c ON a.class_id = c.id
      WHERE asub.id = ? AND c.teacher_id = ?
    `, [submission_id, teacherId]);

    if (verify.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this submission'
      });
    }

    // Update the submission
    const UPDATE_QUERY = `
      UPDATE assignment_submissions 
      SET grade = ?, feedback = ?, status = ?
      WHERE id = ?
    `;
    await pool.query(UPDATE_QUERY, [
      grade || null,
      feedback || null,
      status || 'graded',
      submission_id
    ]);

    res.json({
      success: true,
      message: 'Submission updated successfully'
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating submission'
    });
  }
};

/**
 * Update student question answer (marks, feedback)
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateStudentAnswer = async (req, res) => {
  const {  marks, feedback } = req.body;
  const teacherId = req.body.userId;
  const { answer_id } = req.params;

  try {
    // Verify the teacher has permission to grade this answer
    const [verify] = await pool.query(`
      SELECT q.id 
      FROM question_answers qa
      JOIN questions q ON qa.question_id = q.id
      JOIN classes c ON q.class_id = c.id
      WHERE qa.id = ? AND c.teacher_id = ?
    `, [answer_id, teacherId]);

    if (verify.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to grade this answer'
      });
    }

    // Update the answer
    const UPDATE_QUERY = `
      UPDATE question_answers 
      SET marks = ?, feedback = ?, status = 'graded'
      WHERE id = ?
    `;
    await pool.query(UPDATE_QUERY, [
      marks || null,
      feedback || null,
      answer_id
    ]);

    res.json({
      success: true,
      message: 'Answer graded successfully'
    });
  } catch (error) {
    console.error('Error grading answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading answer'
    });
  }
};

/**
 * Get all submissions for an assignment
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getAssignmentSubmissions = async (req, res) => {
  const { assignment_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Verify the teacher owns this assignment
    const [verify] = await pool.query(`
      SELECT a.id 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.id = ? AND c.teacher_id = ?
    `, [assignment_id, teacherId]);

    if (verify.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions for this assignment'
      });
    }

    // Get all submissions
    const [submissions] = await pool.query(`
      SELECT asub.*, s.student_name, s.profile_image as student_image
      FROM assignment_submissions asub
      JOIN students s ON asub.student_id = s.student_id
      WHERE asub.assignment_id = ?
      ORDER BY asub.submission_date DESC
    `, [assignment_id]);

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
};

/**
 * Get all answers for a question
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getQuestionAnswers = async (req, res) => {
  const { question_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Fetch question type + verify if teacher owns the question
    const [questionResult] = await pool.query(`
      SELECT q.id, q.question_type
      FROM questions q
      JOIN classes c ON q.class_id = c.id
      WHERE q.id = ? AND c.teacher_id = ?
    `, [question_id, teacherId]);

    if (questionResult.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view answers for this question'
      });
    }

    const question = questionResult[0];

    // Skip answers if it's a multiple choice question
    if (question.question_type === 'multiple_choice') {
      return res.status(200).json({
        success: true,
        message: 'This is a multiple choice question. Student answers are not displayed.',
        answers: []
      });
    }

    // Get all answers
    const [answers] = await pool.query(`
      SELECT qa.*, s.student_name, s.profile_image as student_image
      FROM question_answers qa
      JOIN students s ON qa.student_id = s.student_id
      WHERE qa.question_id = ?
      ORDER BY qa.created_at DESC
    `, [question_id]);

    res.json({
      success: true,
      answers
    });

  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching answers'
    });
  }
};
const getStudentEnrollments = async (req, res) => {
  const { student_id } = req.params;
  const teacherId = req.body.userId;

  try {
    // Verify the teacher has at least one class with this student and get student details
    const [verify] = await pool.query(`
      SELECT se.id, s.profile_image, s.student_name
      FROM student_enrollments se
      JOIN classes c ON se.class_id = c.id
      JOIN students s ON se.student_id = s.student_id
      WHERE se.student_id = ? AND c.teacher_id = ?
      LIMIT 1
    `, [student_id, teacherId]);

    if (verify.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student\'s enrollments'
      });
    }

    // Get all enrollments for this student in teacher's classes
    const [enrollments] = await pool.query(`
      SELECT se.*, c.class_name, c.subject, c.grade
      FROM student_enrollments se
      JOIN classes c ON se.class_id = c.id
      WHERE se.student_id = ? AND c.teacher_id = ?
      ORDER BY se.enrollment_date DESC
    `, [student_id, teacherId]);

    res.json({
      success: true,
      enrollments,
      student: {
        profile_image: verify[0].profile_image,
        student_name: verify[0].student_name
      }
    });
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student enrollments'
    });
  }
};

export {
  addQuestion,
  createAssignment,
  addPastPaper,
  addVideo,
  getClassResource,
  deleteQuestion,
  deleteAssignment,
  deletePastPaper,
  deleteVideo,
  getTeacherStudents,
  updateStudentSubmission,
  updateStudentAnswer,
  getAssignmentSubmissions,
  getQuestionAnswers,
  getStudentEnrollments
  

};