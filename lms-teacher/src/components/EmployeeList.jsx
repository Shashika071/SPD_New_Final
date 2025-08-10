import {
  Avatar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/employee/get');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete('http://localhost:4000/api/employee/delete', { data: { id } });
        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleUpdate = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = async () => {
    if (!selectedEmployee.emp_id || !selectedEmployee.name || !selectedEmployee.position || !selectedEmployee.salary) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      await axios.put('http://localhost:4000/api/employee/update', selectedEmployee);
      fetchEmployees(); // Reload the list of employees
      handleClose(); // Close the modal
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee. Please try again.');
    }
  };

  const handleChange = (e) => {
    setSelectedEmployee({ ...selectedEmployee, [e.target.name]: e.target.value });
  };

  return (
    <Container>
      <Typography style={{ fontWeight: 600,textAlign: 'center' }} variant="h4" gutterBottom>
        Employee List
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Profile</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  {employee.profileImage ? (
                    <Avatar src={`http://localhost:4000/images/${employee.profileImage}`} alt="Profile" sx={{ width: 50, height: 50 }} />
                  ) : (
                    <Avatar sx={{ width: 50, height: 50 }}>{employee.name.charAt(0)}</Avatar>
                  )}
                </TableCell>
                <TableCell>{employee.empId}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>${employee.salary}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: '10px' }}
                    onClick={() => handleUpdate(employee)}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Employee Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Employee</DialogTitle>
        <DialogContent>
          <TextField
            label="Employee ID"
            name="emp_id"
            value={selectedEmployee?.emp_id || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Name"
            name="name"
            value={selectedEmployee?.name || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Position"
            name="position"
            value={selectedEmployee?.position || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Salary"
            name="salary"
            value={selectedEmployee?.salary || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeList;
