import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Student
const registerStudent = async (req, res) => {
  const { name, password, email, phone } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (phone.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid phone number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image
    const profileImage = req.file ? req.file.filename : null;

    // Insert student into the database
    const INSERT_STUDENT_QUERY =
      'INSERT INTO students (student_name, email, password, phone, profile_image) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_STUDENT_QUERY, [
      name,
      email,
      hashedPassword,
      phone,
      profileImage,
    ]);

    // Generate token for the newly registered student
    const token = createToken(result.insertId);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Email already exists or error occurred' });
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
      'SELECT student_id, student_name, email, phone, profile_image, registration_date FROM students WHERE student_id = ?';
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

export { 
  loginStudent, 
  registerStudent, 
  getStudents, 
  deleteStudent, 
  updateProfileImage, 
  getStudentById 
};