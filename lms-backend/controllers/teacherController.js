import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Teacher with Qualifications
const registerTeacher = async (req, res) => {
  const { 
    name, 
    password, 
    email, 
    tel_num,
    nic,
    highest_qualification,
    degrees = [],
    diplomas = [],
    specialization,
    experience_years
  } = req.body;

  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (tel_num.length !== 10 || !/^\d+$/.test(tel_num)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }
    if (!nic || nic.length < 5) {
      return res.status(400).json({ success: false, message: 'Please enter a valid NIC' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle profile image
    const profileImage = req.file ? req.file.filename : null;

    // Insert teacher into the database
    const INSERT_TEACHER_QUERY = `
      INSERT INTO teachers (
        teacher_name, 
        email, 
        password, 
        tel_num, 
        profile_image,
        nic,
        highest_qualification,
        degrees,
        diplomas,
        specialization,
        experience_years
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query(INSERT_TEACHER_QUERY, [
      name,
      email,
      hashedPassword,
      tel_num,
      profileImage,
      nic,
      highest_qualification,
      JSON.stringify(degrees),
      JSON.stringify(diplomas),
      specialization,
      experience_years || 0
    ]);

    // Generate token for the newly registered teacher
    const token = createToken(result.insertId);

    // Get the newly created teacher data
    const SELECT_TEACHER_QUERY = 'SELECT * FROM teachers WHERE TeacherID = ?';
    const [teacherRows] = await pool.query(SELECT_TEACHER_QUERY, [result.insertId]);

    res.status(201).json({ 
      success: true, 
      token,
      teacher: {
        id: teacherRows[0].TeacherID,
        name: teacherRows[0].teacher_name,
        email: teacherRows[0].email,
        profileImage: teacherRows[0].profile_image,
        qualifications: {
          highest_qualification: teacherRows[0].highest_qualification,
          degrees: JSON.parse(teacherRows[0].degrees || '[]'),
          diplomas: JSON.parse(teacherRows[0].diplomas || '[]'),
          specialization: teacherRows[0].specialization,
          experience_years: teacherRows[0].experience_years
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Error occurred during registration' 
    });
  }
};

// Login Teacher
const loginTeacher = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_TEACHER_QUERY = 'SELECT * FROM teachers WHERE email = ?';
    const [rows] = await pool.query(SELECT_TEACHER_QUERY, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const teacher = rows[0];
    const isMatch = await bcrypt.compare(password, teacher.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(teacher.TeacherID);

    res.json({ 
      success: true, 
      token,
      teacher: {
        id: teacher.TeacherID,
        name: teacher.teacher_name,
        email: teacher.email,
        profileImage: teacher.profile_image,
        qualifications: {
          highest_qualification: teacher.highest_qualification,
          degrees: JSON.parse(teacher.degrees || '[]'),
          diplomas: JSON.parse(teacher.diplomas || '[]'),
          specialization: teacher.specialization,
          experience_years: teacher.experience_years
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in teacher' });
  }
};

// Get All Teachers
const getTeachers = async (req, res) => {
  try {
    const SELECT_TEACHERS_QUERY = `
      SELECT 
        TeacherID as id,
        teacher_name as name,
        email,
        tel_num as phone,
        profile_image as profileImage,
        nic,
        highest_qualification,
        degrees,
        diplomas,
        specialization,
        experience_years,
        join_date as joinDate
      FROM teachers
      ORDER BY teacher_name
    `;
    const [teachers] = await pool.query(SELECT_TEACHERS_QUERY);

    // Parse JSON fields
    const formattedTeachers = teachers.map(teacher => ({
      ...teacher,
      degrees: JSON.parse(teacher.degrees || '[]'),
      diplomas: JSON.parse(teacher.diplomas || '[]')
    }));

    res.json({ success: true, teachers: formattedTeachers });
  } catch (error) {
    console.error('Error getting teachers:', error);
    res.status(500).json({ success: false, message: 'Error fetching teachers' });
  }
};

// Get Teacher by ID
const getTeacherById = async (req, res) => {
  const  id  = req.body.userId;

  try {
    const SELECT_TEACHER_QUERY = `
      SELECT 
        TeacherID as id,
        teacher_name as name,
        email,
        tel_num as phone,
        profile_image as profileImage,
        nic,
        highest_qualification,
        degrees,
        diplomas,
        specialization,
        experience_years,
        join_date as joinDate
      FROM teachers 
      WHERE TeacherID = ?
    `;
    const [rows] = await pool.query(SELECT_TEACHER_QUERY, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const teacher = rows[0];
    
    res.json({ 
      success: true, 
      teacher: {
        ...teacher,
        degrees: JSON.parse(teacher.degrees || '[]'),
        diplomas: JSON.parse(teacher.diplomas || '[]')
      }
    });
  } catch (error) {
    console.error('Error getting teacher:', error);
    res.status(500).json({ success: false, message: 'Error fetching teacher data' });
  }
};

// Delete Teacher
const deleteTeacher = async (req, res) => {
  const id  = req.body.userId;

  try {
    // First check if teacher exists
    const CHECK_TEACHER_QUERY = 'SELECT TeacherID FROM teachers WHERE TeacherID = ?';
    const [checkRows] = await pool.query(CHECK_TEACHER_QUERY, [id]);

    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Delete teacher
    const DELETE_TEACHER_QUERY = 'DELETE FROM teachers WHERE TeacherID = ?';
    const [result] = await pool.query(DELETE_TEACHER_QUERY, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ success: false, message: 'Error deleting teacher' });
  }
};

// Update Profile Image
const updateProfileImage = async (req, res) => {
  const id = req.body.userId;
  
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }

  const profileImage = req.file.filename;

  try {
    // First check if teacher exists
    const CHECK_TEACHER_QUERY = 'SELECT TeacherID FROM teachers WHERE TeacherID = ?';
    const [checkRows] = await pool.query(CHECK_TEACHER_QUERY, [id]);

    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Update profile image
    const UPDATE_IMAGE_QUERY = 'UPDATE teachers SET profile_image = ? WHERE TeacherID = ?';
    await pool.query(UPDATE_IMAGE_QUERY, [profileImage, id]);

    res.json({ 
      success: true, 
      message: 'Profile image updated successfully',
      profileImage 
    });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ success: false, message: 'Error updating profile image' });
  }
};

// Update Teacher Profile (General Information)
const updateTeacherProfile = async (req, res) => {
  const id  = req.body.userId;
  const {
    name,
    email,
    tel_num,
    nic,
    highest_qualification,
    degrees = [],
    diplomas = [],
    specialization,
    experience_years
  } = req.body;

  try {
    // First check if teacher exists
    const CHECK_TEACHER_QUERY = 'SELECT TeacherID FROM teachers WHERE TeacherID = ?';
    const [checkRows] = await pool.query(CHECK_TEACHER_QUERY, [id]);

    if (checkRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Validate email if changed
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email' });
      }
    }

    // Update teacher profile
    const UPDATE_TEACHER_QUERY = `
      UPDATE teachers SET
        teacher_name = COALESCE(?, teacher_name),
        email = COALESCE(?, email),
        tel_num = COALESCE(?, tel_num),
        nic = COALESCE(?, nic),
        highest_qualification = COALESCE(?, highest_qualification),
        degrees = COALESCE(?, degrees),
        diplomas = COALESCE(?, diplomas),
        specialization = COALESCE(?, specialization),
        experience_years = COALESCE(?, experience_years)
      WHERE TeacherID = ?
    `;

    await pool.query(UPDATE_TEACHER_QUERY, [
      name,
      email,
      tel_num,
      nic,
      highest_qualification,
      JSON.stringify(degrees),
      JSON.stringify(diplomas),
      specialization,
      experience_years,
      id
    ]);

    // Get updated teacher data
    const SELECT_TEACHER_QUERY = 'SELECT * FROM teachers WHERE TeacherID = ?';
    const [teacherRows] = await pool.query(SELECT_TEACHER_QUERY, [id]);

    res.json({
      success: true,
      message: 'Teacher profile updated successfully',
      teacher: {
        id: teacherRows[0].TeacherID,
        name: teacherRows[0].teacher_name,
        email: teacherRows[0].email,
        profileImage: teacherRows[0].profile_image,
        qualifications: {
          highest_qualification: teacherRows[0].highest_qualification,
          degrees: JSON.parse(teacherRows[0].degrees || '[]'),
          diplomas: JSON.parse(teacherRows[0].diplomas || '[]'),
          specialization: teacherRows[0].specialization,
          experience_years: teacherRows[0].experience_years
        }
      }
    });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ 
      success: false, 
      message: error.code === 'ER_DUP_ENTRY' 
        ? 'Email already exists' 
        : 'Error updating teacher profile' 
    });
  }
};

export {
  registerTeacher,
  loginTeacher,
  getTeachers,
  getTeacherById,
  deleteTeacher,
  updateProfileImage,
  updateTeacherProfile
};