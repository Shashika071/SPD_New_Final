import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

import axios from 'axios';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    grade: '',
    fees: '',
    startTime: '09:00',
    endTime: '10:00',
    scheduleDate: format(new Date(), 'yyyy-MM-dd'),
    recurrence: 'weekly',
    location: ''
  });

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const recurrences = ['weekly', 'bi-weekly', 'monthly', 'one-time'];

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Axios instance with auth header
  const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    headers: {
      'Content-Type': 'application/json',
      'token': getAuthToken()
    }
  });

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/teacher');
      setClasses(response.data.classes);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch classes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      className: '',
      subject: '',
      grade: '',
      fees: '',
      startTime: '09:00',
      endTime: '10:00',
      scheduleDate: format(new Date(), 'yyyy-MM-dd'),
      recurrence: 'weekly',
      location: ''
    });
    setCurrentClass(null);
  };

  // Open create dialog
  const handleCreateClick = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEditClick = (classItem) => {
    setCurrentClass(classItem);
    setFormData({
      className: classItem.className,
      subject: classItem.subject,
      grade: classItem.grade,
      fees: classItem.fees || '',
      startTime: classItem.schedules[0]?.startTime || '09:00',
      endTime: classItem.schedules[0]?.endTime || '10:00',
      scheduleDate: classItem.schedules[0]?.scheduleDate || format(new Date(), 'yyyy-MM-dd'),
      recurrence: classItem.schedules[0]?.recurrence || 'weekly',
      location: classItem.schedules[0]?.location || ''
    });
    setOpenDialog(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData
      };

      if (currentClass) {
        // Update existing class
        await api.put(`/classes/${currentClass.id}`, {
          ...payload,
          scheduleId: currentClass.schedules[0]?.id
        });
        setSnackbar({
          open: true,
          message: 'Class updated successfully',
          severity: 'success'
        });
      } else {
        // Create new class
        await api.post('/classes', payload);
        setSnackbar({
          open: true,
          message: 'Class created successfully',
          severity: 'success'
        });
      }

      fetchClasses();
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Operation failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/classes/${currentClass?.id}`);
      setSnackbar({
        open: true,
        message: 'Class deleted successfully',
        severity: 'success'
      });
      fetchClasses();
      setOpenDeleteDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Delete failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Class Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Class
        </Button>
      </Box>

      {/* Classes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Class Name</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Fees</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell>{classItem.className}</TableCell>
                <TableCell>{classItem.subject}</TableCell>
                <TableCell>Grade {classItem.grade}</TableCell>
                <TableCell>
                  {classItem.fees ? `RS.${classItem.fees}` : '-'}
                </TableCell>
                <TableCell>
                  {classItem.schedules.map(schedule => (
                    <Box key={schedule.id} sx={{ mb: 1 }}>
                      <Chip 
                        icon={<ScheduleIcon />}
                        label={`${format(parseISO(schedule.scheduleDate), 'MMM d, yyyy')} 
                        ${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`}
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={schedule.recurrence}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </TableCell>
                <TableCell>
                  {classItem.schedules[0]?.location}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEditClick(classItem)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton onClick={() => {
                    setCurrentClass(classItem);
                    setOpenDeleteDialog(true);
                  }}>
                    <DeleteIcon color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentClass ? 'Edit Class' : 'Create New Class'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Class Name"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {grades.map(grade => (
                <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fees"
              name="fees"
              type="number"
              value={formData.fees}
              onChange={handleInputChange}
              InputProps={{ 
                startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
              }}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              name="scheduleDate"
              value={formData.scheduleDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Time"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
              <TextField
                label="End Time"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Box>
            <TextField
              select
              label="Recurrence"
              name="recurrence"
              value={formData.recurrence}
              onChange={handleInputChange}
              fullWidth
            >
              {recurrences.map(option => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {currentClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{currentClass?.className}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassManagement;