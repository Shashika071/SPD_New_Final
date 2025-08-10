import pool from '../config/db.js';

/**
 * Get all available classes for students
 */
const getAvailableClasses = async (req, res) => {
  try {
    const SELECT_CLASSES_QUERY = `
      SELECT 
        c.id,
        c.class_name as className,
        c.subject,
        c.grade,
        c.fees,
        t.teacher_name as teacherName,
        cs.start_time as startTime,
        cs.end_time as endTime,
        cs.schedule_date as scheduleDate,
        cs.recurrence,
        cs.location
      FROM classes c
      JOIN teachers t ON c.teacher_id = t.TeacherID
      LEFT JOIN class_schedules cs ON c.id = cs.class_id
      ORDER BY c.class_name, cs.schedule_date
    `;
    
    const [classes] = await pool.query(SELECT_CLASSES_QUERY);

    // Group schedules by class
    const classMap = {};
    classes.forEach(row => {
      if (!classMap[row.id]) {
        classMap[row.id] = {
          id: row.id,
          className: row.className,
          subject: row.subject,
          grade: row.grade,
          fees: row.fees,
          teacherName: row.teacherName,
          schedules: []
        };
      }
      if (row.startTime) {
        classMap[row.id].schedules.push({
          startTime: row.startTime,
          endTime: row.endTime,
          scheduleDate: row.scheduleDate,
          recurrence: row.recurrence,
          location: row.location
        });
      }
    });

    res.json({ 
      success: true, 
      classes: Object.values(classMap) 
    });
  } catch (error) {
    console.error('Error fetching available classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching available classes' 
    });
  }
};

/**
 * Enroll in a class (initiate payment)
 */
const enrollInClass = async (req, res) => {
  const { class_id } = req.body;
  const studentId = req.body.userId;

  try {
    await pool.query('START TRANSACTION');

    // Get class details
    const [classResult] = await pool.query(
      'SELECT id, fees FROM classes WHERE id = ?',
      [class_id]
    );

    if (classResult.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Class not found' 
      });
    }

    const classFees = classResult[0].fees || 0;

    // Check if already enrolled
    const [enrollmentCheck] = await pool.query(
      'SELECT id FROM student_enrollments WHERE student_id = ? AND class_id = ?',
      [studentId, class_id]
    );

    if (enrollmentCheck.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ 
        success: false, 
        message: 'Already enrolled in this class' 
      });
    }

    // Create enrollment record
    const [enrollmentResult] = await pool.query(
      `INSERT INTO student_enrollments 
        (student_id, class_id, payment_status, payment_amount)
       VALUES (?, ?, 'pending', ?)`,
      [studentId, class_id, classFees]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      enrollmentId: enrollmentResult.insertId,
      paymentRequired: classFees > 0,
      paymentAmount: classFees,
      paymentLink: classFees > 0 ? 
        `/api/payment/initiate/${enrollmentResult.insertId}` : 
        null
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error enrolling in class:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error enrolling in class' 
    });
  }
};

/**
 * Complete enrollment after payment
 */
const completeEnrollment = async (req, res) => {
  const { enrollmentId } = req.params;
  const studentId = req.body.userId;

  try {
    await pool.query('START TRANSACTION');

    // Verify enrollment belongs to student
    const [enrollment] = await pool.query(
      `SELECT id, class_id, payment_status, payment_amount 
       FROM student_enrollments 
       WHERE id = ? AND student_id = ?`,
      [enrollmentId, studentId]
    );

    if (enrollment.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        success: false, 
        message: 'Enrollment not found' 
      });
    }

    if (enrollment[0].payment_status === 'completed') {
      await pool.query('ROLLBACK');
      return res.json({ 
        success: true, 
        message: 'Enrollment already completed' 
      });
    }

    // Update enrollment status
    await pool.query(
      `UPDATE student_enrollments 
       SET payment_status = 'completed', payment_date = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [enrollmentId]
    );

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Enrollment completed successfully'
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error completing enrollment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error completing enrollment' 
    });
  }
};

/**
 * Get enrolled classes for student
 */
const getMyClasses = async (req, res) => {
  const studentId = req.body.userId;

  try {
    const SELECT_ENROLLED_CLASSES_QUERY = `
      SELECT 
        c.id,
        c.class_name as className,
        c.subject,
        c.grade,
        t.teacher_name as teacherName,
        se.enrollment_date as enrollmentDate,
        cs.start_time as startTime,
        cs.end_time as endTime,
        cs.schedule_date as scheduleDate,
        cs.recurrence,
        cs.location
      FROM student_enrollments se
      JOIN classes c ON se.class_id = c.id
      JOIN teachers t ON c.teacher_id = t.TeacherID
      LEFT JOIN class_schedules cs ON c.id = cs.class_id
      WHERE se.student_id = ? AND se.payment_status = 'completed'
      ORDER BY c.class_name, cs.schedule_date
    `;
    
    const [classes] = await pool.query(SELECT_ENROLLED_CLASSES_QUERY, [studentId]);

    // Group schedules by class
    const classMap = {};
    classes.forEach(row => {
      if (!classMap[row.id]) {
        classMap[row.id] = {
          id: row.id,
          className: row.className,
          subject: row.subject,
          grade: row.grade,
          teacherName: row.teacherName,
          enrollmentDate: row.enrollmentDate,
          schedules: []
        };
      }
      if (row.startTime) {
        classMap[row.id].schedules.push({
          startTime: row.startTime,
          endTime: row.endTime,
          scheduleDate: row.scheduleDate,
          recurrence: row.recurrence,
          location: row.location
        });
      }
    });

    res.json({ 
      success: true, 
      classes: Object.values(classMap) 
    });
  } catch (error) {
    console.error('Error fetching enrolled classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching enrolled classes' 
    });
  }
};

export {
  getAvailableClasses,
  enrollInClass,
  completeEnrollment,
  getMyClasses
};