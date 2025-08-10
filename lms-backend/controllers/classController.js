import pool from '../config/db.js';

/**
 * Create a new class with schedule
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const createClass = async (req, res) => {
  const { 
    className, 
    subject, 
    grade, 
    fees,
    startTime,
    endTime,
    scheduleDate,
    recurrence,
    location
  } = req.body;

  const teacherId = req.body.userId;

  if (!className || !subject || !grade || !startTime || !endTime || !scheduleDate) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }

  try {
    await pool.query('START TRANSACTION');

    // Create the class
    const INSERT_CLASS_QUERY = `
      INSERT INTO classes (class_name, subject, grade, teacher_id, fees)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [classResult] = await pool.query(INSERT_CLASS_QUERY, [
      className, 
      subject, 
      grade, 
      teacherId,
      fees || null
    ]);

    const classId = classResult.insertId;

    // Create the schedule
    const INSERT_SCHEDULE_QUERY = `
      INSERT INTO class_schedules 
        (class_id, start_time, end_time, schedule_date, recurrence, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [scheduleResult] = await pool.query(INSERT_SCHEDULE_QUERY, [
      classId,
      startTime,
      endTime,
      scheduleDate,
      recurrence || 'weekly',
      location || null
    ]);

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      class: {
        id: classId,
        className,
        subject,
        grade,
        fees,
        teacherId
      },
      schedule: {
        id: scheduleResult.insertId,
        classId,
        startTime,
        endTime,
        scheduleDate,
        recurrence,
        location
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating class:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating class and schedule' 
    });
  }
};

/**
 * Get all classes with schedules for the authenticated teacher
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getClasses = async (req, res) => {
  const teacherId = req.body.userId;

  try {
    const SELECT_CLASSES_QUERY = `
      SELECT 
        c.id,
        c.class_name as className,
        c.subject,
        c.grade,
        c.fees,
        c.teacher_id as teacherId,
        cs.id as scheduleId,
        cs.start_time as startTime,
        cs.end_time as endTime,
        cs.schedule_date as scheduleDate,
        cs.recurrence,
        cs.location
      FROM classes c
      LEFT JOIN class_schedules cs ON c.id = cs.class_id
      WHERE c.teacher_id = ?
      ORDER BY c.class_name, cs.schedule_date
    `;
    
    const [classes] = await pool.query(SELECT_CLASSES_QUERY, [teacherId]);

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
          teacherId: row.teacherId,
          schedules: []
        };
      }
      if (row.scheduleId) {
        classMap[row.id].schedules.push({
          id: row.scheduleId,
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
    console.error('Error fetching classes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching classes' 
    });
  }
};

/**
 * Update a class and its schedule
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { 
    className, 
    subject, 
    grade,
    fees,
    scheduleId,
    startTime,
    endTime,
    scheduleDate,
    recurrence,
    location
  } = req.body;

  const teacherId = req.body.userId;

  try {
    await pool.query('START TRANSACTION');

    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [id, teacherId]);

    if (verifyResult.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this class' 
      });
    }

    // Update the class
    const UPDATE_CLASS_QUERY = `
      UPDATE classes
      SET 
        class_name = ?,
        subject = ?,
        grade = ?,
        fees = ?
      WHERE id = ?
    `;
    
    const [classResult] = await pool.query(UPDATE_CLASS_QUERY, [
      className, 
      subject, 
      grade,
      fees || null,
      id
    ]);

    // Update the schedule
    const UPDATE_SCHEDULE_QUERY = `
      UPDATE class_schedules
      SET
        start_time = ?,
        end_time = ?,
        schedule_date = ?,
        recurrence = ?,
        location = ?
      WHERE id = ? AND class_id = ?
    `;
    
    const [scheduleResult] = await pool.query(UPDATE_SCHEDULE_QUERY, [
      startTime,
      endTime,
      scheduleDate,
      recurrence,
      location,
      scheduleId,
      id
    ]);

    await pool.query('COMMIT');

    res.json({ 
      success: true,
      class: {
        id,
        className,
        subject,
        grade,
        fees
      },
      schedule: {
        id: scheduleId,
        startTime,
        endTime,
        scheduleDate,
        recurrence,
        location
      }
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating class:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating class and schedule' 
    });
  }
};

/**
 * Delete a class and its schedules
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const deleteClass = async (req, res) => {
  const { id } = req.params;
  const teacherId = req.body.userId;

  try {
    await pool.query('START TRANSACTION');

    // Verify the teacher owns this class
    const VERIFY_OWNER_QUERY = 'SELECT id FROM classes WHERE id = ? AND teacher_id = ?';
    const [verifyResult] = await pool.query(VERIFY_OWNER_QUERY, [id, teacherId]);

    if (verifyResult.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this class' 
      });
    }

    // Delete schedules first
    const DELETE_SCHEDULES_QUERY = `
      DELETE FROM class_schedules WHERE class_id = ?
    `;
    await pool.query(DELETE_SCHEDULES_QUERY, [id]);

    // Delete the class
    const DELETE_CLASS_QUERY = 'DELETE FROM classes WHERE id = ?';
    const [result] = await pool.query(DELETE_CLASS_QUERY, [id]);

    await pool.query('COMMIT');

    res.json({ 
      success: true, 
      message: 'Class and associated schedules deleted successfully' 
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error deleting class:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting class' 
    });
  }
};

export {
  createClass,
  getClasses,
  updateClass,
  deleteClass
};