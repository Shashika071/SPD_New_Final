import pool from '../config/db.js'; // Assuming db.js exports a configured MySQL pool

// Add Employee (Handles one image per employee)
export const addEmployee = async (req, res) => {
  try {
    const { empId, name, position, salary } = req.body;

    if (!empId || !name || !position || !salary) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Insert employee into the database
    const [employeeResult] = await pool.query(
      'INSERT INTO employees (emp_id, name, position, salary) VALUES (?, ?, ?, ?)',
      [empId, name, position, salary]
    );
    const employeeId = employeeResult.insertId;

    // Insert or update the image (replace existing image if already exists)
    if (req.file) {
      await pool.query(
        `INSERT INTO employee_images (employee_id, file_name, file_type, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), file_type = VALUES(file_type), file_path = VALUES(file_path)`,
        [employeeId, req.file.filename, req.file.mimetype, req.file.path]
      );
    }

    res.json({
      success: true,
      message: 'Employee added successfully!',
      employee: {
        id: employeeId,
        empId,
        name,
        position,
        salary,
        profileImage: req.file ? req.file.filename : null, // Return the image file name
      },
    });
  } catch (error) {
    console.error('Error adding employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add the employee. Please try again.',
      error: error.message,
    });
  }
};

// Get All Employees (Includes Image Data)
export const getAllEmployees = async (req, res) => {
  try {
    const [employees] = await pool.query(
      'SELECT e.id, e.emp_id, e.name, e.position, e.salary, ei.file_name FROM employees e LEFT JOIN employee_images ei ON e.id = ei.employee_id'
    );

    const groupedEmployees = employees.reduce((acc, emp) => {
      if (!acc[emp.id]) {
        acc[emp.id] = {
          id: emp.id,
          empId: emp.emp_id,
          name: emp.name,
          position: emp.position,
          salary: emp.salary,
          profileImage: null,
        };
      }

      if (emp.file_name) {
        acc[emp.id].profileImage = emp.file_name;
      }

      return acc;
    }, {});

    res.json({
      success: true,
      message: 'Employees fetched successfully',
      employees: Object.values(groupedEmployees),
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees. Please try again.',
      error: error.message,
    });
  }
};

// Update Employee (Handles image update)
export const updateEmployee = async (req, res) => {
  try {
    const { id, name, position, salary } = req.body;

    if (!id || !name || !position || !salary) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Update employee details
    const [updateResult] = await pool.query(
      'UPDATE employees SET name = ?, position = ?, salary = ? WHERE id = ?',
      [name, position, salary, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    // Update image if new one is uploaded
    if (req.file) {
      await pool.query(
        `INSERT INTO employee_images (employee_id, file_name, file_type, file_path)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), file_type = VALUES(file_type), file_path = VALUES(file_path)`,
        [id, req.file.filename, req.file.mimetype, req.file.path]
      );
    }

    res.json({
      success: true,
      message: 'Employee updated successfully!',
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee. Please try again.',
      error: error.message,
    });
  }
};

// Delete Employee (Handles image deletion)
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required to delete employee.' });
    }

    // Delete image if exists
    await pool.query('DELETE FROM employee_images WHERE employee_id = ?', [id]);

    const [deleteResult] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee. Please try again.',
      error: error.message,
    });
  }
};
