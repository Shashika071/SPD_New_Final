import { Avatar, Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import axios from 'axios';

const AddEmployee = () => {
  const [employeeDetails, setEmployeeDetails] = useState({
    emp_id: '',
    name: '',
    position: '',
    salary: '',
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  const handleChange = (e) => {
    setEmployeeDetails({ ...employeeDetails, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setEmployeeDetails({ ...employeeDetails, profileImage: file });

    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Set the image preview URL
    };
    if (file) {
      reader.readAsDataURL(file); // Convert the file to a base64 URL
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { emp_id, name, position, salary, profileImage } = employeeDetails;
    if (!emp_id || !name || !position || !salary) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('empId', emp_id);
    formData.append('name', name);
    formData.append('position', position);
    formData.append('salary', salary);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    try {
      await axios.post('http://localhost:4000/api/employee/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Employee added successfully!');
      setEmployeeDetails({
        emp_id: '',
        name: '',
        position: '',
        salary: '',
        profileImage: null,
      });
      setImagePreview(null); // Reset image preview after submission
    } catch (error) {
      alert('Failed to add employee. Please try again.');
    }
  };

  return (
    <Container>
      <Typography style={{ fontWeight: 600,textAlign: 'center' }} variant="h4" gutterBottom>
        Add Employee
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Employee ID"
          name="emp_id"
          fullWidth
          onChange={handleChange}
          value={employeeDetails.emp_id}
          margin="normal"
        />
        <TextField
          label="Name"
          name="name"
          fullWidth
          onChange={handleChange}
          value={employeeDetails.name}
          margin="normal"
        />
        <TextField
          label="Position"
          name="position"
          fullWidth
          onChange={handleChange}
          value={employeeDetails.position}
          margin="normal"
        />
        <TextField
          label="Salary"
          name="salary"
          type="number"
          fullWidth
          onChange={handleChange}
          value={employeeDetails.salary}
          margin="normal"
        />
        
        <Box marginTop={2} textAlign="center">
          {/* Image Preview */}
          {imagePreview ? (
            <Avatar
              alt="Profile Image"
              src={imagePreview}
              sx={{ width: 100, height: 100, marginBottom: 2 }}
            />
          ) : (
            <Avatar sx={{ width: 100, height: 100, marginBottom: 2 }} />
          )}

          {/* File Input */}
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-image-upload"
          />
          <label htmlFor="profile-image-upload">
            <Button variant="outlined" component="span">
              Upload Image
            </Button>
          </label>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ marginTop: 3 }}
        >
          Add Employee
        </Button>
      </form>
    </Container>
  );
};

export default AddEmployee;
