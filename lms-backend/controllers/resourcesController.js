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

  console.log('Received past_paper_id:', past_paper_id);
  console.log('Teacher ID:', teacherId);

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

export {
  addQuestion,
  createAssignment,
  addPastPaper,
  addVideo,
  getClassResource,
  deleteQuestion,
  deleteAssignment,
  deletePastPaper,
  deleteVideo
  

};