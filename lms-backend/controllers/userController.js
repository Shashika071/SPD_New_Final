import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Student
const generateStudentId = (name) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `PH-ST-${initials}-${randomNum}`;
};

// Register Student
const registerStudent = async (req, res) => {
  const { name, password, email, phone, parentPhone } = req.body;
  
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (phone.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid student phone number' });
    }
    if (parentPhone && parentPhone.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid parent phone number' });
    }

    // Check if email already exists
    const CHECK_EMAIL_QUERY = 'SELECT email FROM students WHERE email = ?';
    const [emailExists] = await pool.query(CHECK_EMAIL_QUERY, [email]);
    
    if (emailExists.length > 0) {
      return res.json({ success: false, message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image
    const profileImage = req.file ? req.file.filename : null;

    // Generate student ID
    const studentId = generateStudentId(name);

    // Insert student into the database
    const INSERT_STUDENT_QUERY = `
      INSERT INTO students 
        (student_id, student_name, email, password, phone, parent_phone, profile_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(INSERT_STUDENT_QUERY, [
      studentId,
      name,
      email,
      hashedPassword,
      phone,
      parentPhone || null, // Make parent phone optional
      profileImage,
    ]);

    // Generate token for the newly registered student
    const token = createToken(studentId); // Now using the generated studentId

    res.json({ 
      success: true, 
      token,
      studentId, // Return the generated ID to the client
      message: 'Registration successful' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.json({ 
      success: false, 
      message: 'Error occurred during registration' 
    });
  }
};

// Login Student
const loginStudent = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_STUDENT_QUERY = 'SELECT * FROM students WHERE email = ?';
    const [rows] = await pool.query(SELECT_STUDENT_QUERY, [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(student.student_id);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Error logging in student' });
  }
};

// Get Students
const getStudents = async (req, res) => {
  try {
    const SELECT_STUDENTS_QUERY =
      'SELECT student_id, student_name, email, phone, profile_image FROM students';
    const [students] = await pool.query(SELECT_STUDENTS_QUERY);

    res.json({ success: true, students });
  } catch (error) {
    console.error('Error getting students:', error);
    res.status(500).json({ success: false, message: 'Error getting students' });
  }
};

// Delete Student
const deleteStudent = async (req, res) => {
  const { userId } = req.body;
  try {
    const DELETE_STUDENT_QUERY = 'DELETE FROM students WHERE student_id = ?';
    const [result] = await pool.query(DELETE_STUDENT_QUERY, [userId ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
};

// Update Profile Image
const updateProfileImage = async (req, res) => {
  const studentId = req.body.userId;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Image is required' });
  }

  const profileImage = req.file.filename;

  const UPDATE_PROFILE_IMAGE_QUERY = `
    UPDATE students SET profile_image = ? WHERE student_id = ?
  `;

  try {
    await pool.query(UPDATE_PROFILE_IMAGE_QUERY, [profileImage, studentId]);
    res.status(200).json({ 
      success: true, 
      message: 'Profile image updated', 
      profile_image: profileImage 
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ success: false, message: 'Error updating profile image' });
  }
};

// Get Student by ID
const getStudentById = async (req, res) => {
  const { userId } = req.body;

  try {
    const SELECT_STUDENT_QUERY =
      'SELECT student_id, student_name, email, phone, parent_phone, profile_image, registration_date FROM students WHERE student_id = ?';
    const [rows] = await pool.query(SELECT_STUDENT_QUERY, [userId]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student: rows[0] });
  } catch (error) {
    console.error('Error getting student by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching student data' });
  }
};
 const getStudentAssignments = async (req, res) => {
  const { userId } = req.body;

  try {
    // First get all classes the student is enrolled in
    const GET_ENROLLED_CLASSES = `
      SELECT class_id FROM student_enrollments 
      WHERE student_id = ? AND payment_status = 'completed'
    `;
    const [enrolledClasses] = await pool.query(GET_ENROLLED_CLASSES, [userId]);

    if (enrolledClasses.length === 0) {
      return res.json({ 
        success: true, 
        assignments: [], 
        message: 'No enrolled classes found' 
      });
    }

    const classIds = enrolledClasses.map(c => c.class_id);

    // Get assignments for these classes
    const GET_ASSIGNMENTS_QUERY = `
      SELECT a.*, c.class_name 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      WHERE a.class_id IN (?)
      ORDER BY a.due_date ASC
    `;
    const [assignments] = await pool.query(GET_ASSIGNMENTS_QUERY, [classIds]);

    // For each assignment, check if student has submitted and get feedback
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const GET_SUBMISSION_QUERY = `
          SELECT id, submission_date, grade, status, feedback 
          FROM assignment_submissions 
          WHERE assignment_id = ? AND student_id = ?
          LIMIT 1
        `;
        const [submission] = await pool.query(GET_SUBMISSION_QUERY, [
          assignment.id, 
          userId
        ]);

        return {
          ...assignment,
          submission: submission[0] || null
        };
      })
    );

    res.json({ 
      success: true, 
      assignments: assignmentsWithStatus 
    });
  } catch (error) {
    console.error('Error getting student assignments:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignments' 
    });
  }
};
const getStudentQuestions = async (req, res) => {
  const { userId } = req.body;

  try {
    // Get enrolled classes
    const [enrolledClasses] = await pool.query(
      `SELECT class_id FROM student_enrollments 
       WHERE student_id = ? AND payment_status = 'completed'`, 
      [userId]
    );

    if (!enrolledClasses.length) {
      return res.json({ success: true, questions: [] });
    }

    const classIds = enrolledClasses.map(c => c.class_id);
    const [questions] = await pool.query(
      `SELECT q.*, c.class_name FROM questions q
       JOIN classes c ON q.class_id = c.id
       WHERE q.class_id IN (?)
       ORDER BY q.due_date ASC`,
      [classIds]
    );

    const questionsWithDetails = await Promise.all(
      questions.map(async (question) => {
        // Get answer with feedback
        const [answer] = await pool.query(
          `SELECT id, answer_text, document_url, marks, status, feedback 
           FROM question_answers 
           WHERE question_id = ? AND student_id = ? LIMIT 1`,
          [question.id, userId]
        );

        const result = {
          ...question,
          answer: answer[0] || null
        };

        // Only add options and quizScore for multiple_choice/true_false
        if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
          const [options] = await pool.query(
            `SELECT id, option_text, is_correct 
             FROM question_options WHERE question_id = ?`,
            [question.id]
          );

          const [quizAttempt] = await pool.query(
            `SELECT score FROM quiz_attempts
             WHERE quiz_id = ? AND student_id = ?
             ORDER BY attempt_date DESC LIMIT 1`,
            [question.id, userId]
          );

          result.options = options;
          result.quizScore = quizAttempt[0]?.score || null;
        }

        return result;
      })
    );

    res.json({ success: true, questions: questionsWithDetails });
  } catch (error) {
    console.error('Error getting questions:', error);
    res.status(500).json({ success: false, message: 'Error fetching questions' });
  }
};

// Get a single assignment with details
const getAssignmentDetails = async (req, res) => {
  const { userId, assignmentId } = req.body;

  try {
    // Verify student has access to this assignment
    const VERIFY_ACCESS_QUERY = `
      SELECT a.*, c.class_name 
      FROM assignments a
      JOIN classes c ON a.class_id = c.id
      JOIN student_enrollments se ON a.class_id = se.class_id
      WHERE a.id = ? AND se.student_id = ? AND se.payment_status = 'completed'
    `;
    const [assignment] = await pool.query(VERIFY_ACCESS_QUERY, [assignmentId, userId]);

    if (assignment.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied or assignment not found' 
      });
    }

    // Get student's submission if exists
    const GET_SUBMISSION_QUERY = `
      SELECT * FROM assignment_submissions 
      WHERE assignment_id = ? AND student_id = ?
    `;
    const [submission] = await pool.query(GET_SUBMISSION_QUERY, [assignmentId, userId]);

    res.json({ 
      success: true,
      assignment: assignment[0],
      submission: submission[0] || null
    });
  } catch (error) {
    console.error('Error getting assignment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching assignment details' 
    });
  }
};

// Get a single question with details
const getQuestionDetails = async (req, res) => {
  const { userId, questionId } = req.body;

  try {
    const [question] = await pool.query(
      `SELECT q.*, c.class_name FROM questions q
       JOIN classes c ON q.class_id = c.id
       JOIN student_enrollments se ON q.class_id = se.class_id
       WHERE q.id = ? AND se.student_id = ? AND se.payment_status = 'completed'`,
      [questionId, userId]
    );

    if (!question.length) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [answer] = await pool.query(
      `SELECT * FROM question_answers 
       WHERE question_id = ? AND student_id = ?`,
      [questionId, userId]
    );

    const result = {
      question: question[0],
      answer: answer[0] || null
    };

    // Only add options and quizScore for multiple_choice/true_false
    if (question[0].question_type === 'multiple_choice' || question[0].question_type === 'true_false') {
      const [options] = await pool.query(
        `SELECT id, option_text, is_correct 
         FROM question_options WHERE question_id = ?`,
        [questionId]
      );

      const [quizAttempt] = await pool.query(
        `SELECT score FROM quiz_attempts
         WHERE quiz_id = ? AND student_id = ?
         ORDER BY attempt_date DESC LIMIT 1`,
        [questionId, userId]
      );

      result.options = options;
      result.correctOptions = options.filter(opt => opt.is_correct);
      result.quizScore = quizAttempt[0]?.score || null;
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error getting question details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export { 
  loginStudent, 
  registerStudent, 
  getStudents, 
  deleteStudent, 
  updateProfileImage, 
  getStudentById,
  getStudentAssignments,
  getStudentQuestions,
  getAssignmentDetails,
  getQuestionDetails
};