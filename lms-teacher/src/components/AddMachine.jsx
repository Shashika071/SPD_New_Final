import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DatePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import axios from 'axios';

const AddMachine = () => {
  const [machineDetails, setMachineDetails] = useState({
    machineId: '',
    machineName: '',
    description: '',
    purchaseDate: null,
    status: 'Active',
    hourlyRate: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMachineDetails({ ...machineDetails, [name]: value });
  };

  const handleDateChange = (date) => {
    setMachineDetails({ ...machineDetails, purchaseDate: date });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { machineId, machineName, purchaseDate, status } = machineDetails;

    if (!machineId || !machineName) {
      alert('Machine ID and Name are required fields');
      return;
    }

    const formData = new FormData();
    formData.append('machineId', machineId);
    formData.append('machineName', machineName);
    formData.append('description', machineDetails.description);
    formData.append('purchaseDate', purchaseDate ? purchaseDate.toISOString().split('T')[0] : '');
    formData.append('status', status);
    formData.append('hourlyRate', machineDetails.hourlyRate);

    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await axios.post('http://localhost:4000/api/machine/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        alert('Machine added successfully!');
        // Reset form
        setMachineDetails({
          machineId: '',
          machineName: '',
          description: '',
          purchaseDate: null,
          status: 'Active',
          hourlyRate: '',
        });
        setImages([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error('Error adding machine:', error);
      alert(error.response?.data?.message || 'Failed to add machine');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Add New Machine
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine ID"
              name="machineId"
              value={machineDetails.machineId}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Machine Name"
              name="machineName"
              value={machineDetails.machineName}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={machineDetails.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Purchase Date"
                value={machineDetails.purchaseDate}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={machineDetails.status}
                onChange={handleChange}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="In Maintenance">In Maintenance</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hourly Rate ($)"
              name="hourlyRate"
              type="number"
              value={machineDetails.hourlyRate}
              onChange={handleChange}
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {imagePreviews.map((preview, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                  />
                  <IconButton
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      }
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Add Machine
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddMachine;