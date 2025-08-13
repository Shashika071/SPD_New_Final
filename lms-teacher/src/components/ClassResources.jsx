import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  Schedule as ScheduleIcon,
  AccessTime as TimeIcon,
  OndemandVideo as VideoIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import React, { useEffect, useState } from 'react';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const questionTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
];

const ClassResources = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [resources, setResources] = useState({
    questions: [],
    assignments: [],
    pastPapers: [],
    videos: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteItem, setDeleteItem] = useState({ type: '', id: null, title: '' });
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showClassSelection, setShowClassSelection] = useState(true);

  // Form states
  const [questionForm, setQuestionForm] = useState({
    class_id: '',
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    due_date: null,
    time_limit: 1,
    options: [{ option_text: '', is_correct: false }]
  });
  const [assignmentForm, setAssignmentForm] = useState({
    class_id: '',
    title: '',
    description: '',
    due_date: '',
    total_points: 100,
    questions: []
  });
  const [pastPaperForm, setPastPaperForm] = useState({
    class_id: '',
    title: '',
    description: '',
    year: new Date().getFullYear(),
    paper_url: ''
  });
  const [videoForm, setVideoForm] = useState({
    class_id: '',
    title: '',
    description: '',
    video_url: '',
    duration: 0
  });

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

  // Fetch teacher's classes
  const fetchTeacherClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes/teacher');
      setClasses(response.data.classes || []);
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

  // Fetch resources for selected class
  const fetchResources = async (classId) => {
    try {
      setLoading(true);
      const response = await api.get(`/classes/${classId}/resources`);
      setResources({
        questions: response.data.resources.questions || [],
        assignments: response.data.resources.assignments || [],
        pastPapers: response.data.resources.past_papers || [],
        videos: response.data.resources.videos || []
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch resources',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete resource function
  const handleDeleteResource = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      let requestConfig = {};
      
      switch (deleteItem.type) {
        case 'question':
          endpoint = `/questions/${deleteItem.id}`;
          await api.delete(endpoint);
          break;
        case 'assignment':
          endpoint = `/assignments/${deleteItem.id}`;
          await api.delete(endpoint);
          break;
        case 'pastPaper':
          endpoint = `/past-papers/delete`;
          await api.delete(endpoint, {
            data: { past_paper_id: deleteItem.id }
          });
          break;
        case 'video':
          endpoint = `/videos/${deleteItem.id}`;
          await api.delete(endpoint);
          break;
        default:
          throw new Error('Invalid resource type');
      }
      
      setSnackbar({
        open: true,
        message: `${deleteItem.type.charAt(0).toUpperCase() + deleteItem.type.slice(1)} deleted successfully`,
        severity: 'success'
      });
      
      // Refresh resources
      fetchResources(selectedClass);
      setOpenDeleteDialog(false);
      setDeleteItem({ type: '', id: null, title: '' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to delete resource',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirmation = (type, id, title) => {
    setDeleteItem({ type, id, title });
    setOpenDeleteDialog(true);
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteItem({ type: '', id: null, title: '' });
  };

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  // Handle class selection
  const handleClassSelect = (classId) => {
    setSelectedClass(classId);
    fetchResources(classId);
    setShowClassSelection(false);
    
    // Update class_id in all forms
    setQuestionForm(prev => ({ ...prev, class_id: classId }));
    setAssignmentForm(prev => ({ ...prev, class_id: classId }));
    setPastPaperForm(prev => ({ ...prev, class_id: classId }));
    setVideoForm(prev => ({ ...prev, class_id: classId }));
  };

  // Handle back to class selection
  const handleBackToClassSelection = () => {
    setSelectedClass('');
    setShowClassSelection(true);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Open dialog for adding resources
  const handleOpenDialog = () => {
    const resourceTypes = ['question', 'assignment', 'past-paper', 'video'];
    setDialogType(resourceTypes[activeTab]);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle question form changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question type change specifically
  const handleQuestionTypeChange = (e) => {
    const { value } = e.target;
    setQuestionForm(prev => ({
      ...prev,
      question_type: value,
      time_limit: value === 'multiple_choice' ? prev.time_limit : null
    }));
  };

  // Handle option changes
  const handleOptionChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newOptions = [...questionForm.options];
    
    newOptions[index] = {
      ...newOptions[index],
      [name]: type === 'checkbox' ? checked : value
    };
    
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Add new option
  const addOption = () => {
    setQuestionForm(prev => ({
      ...prev,
      options: [...prev.options, { option_text: '', is_correct: false }]
    }));
  };

  // Remove option
  const removeOption = (index) => {
    const newOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  // Handle assignment form changes
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle past paper form changes
  const handlePastPaperChange = (e) => {
    const { name, value } = e.target;
    setPastPaperForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle video form changes
  const handleVideoChange = (e) => {
    const { name, value } = e.target;
    setVideoForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form based on dialog type
  const handleSubmit = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      let data = {};
      let successMessage = '';

      switch (dialogType) {
        case 'question':
          endpoint = '/questions';
          data = {
            class_id: selectedClass,
            question_text: questionForm.question_text,
            question_type: questionForm.question_type,
            points: questionForm.points,
            due_date: questionForm.due_date,
            time_limit: questionForm.question_type === 'multiple_choice' ? questionForm.time_limit : null,
            options: questionForm.question_type === 'multiple_choice' ? questionForm.options : undefined
          };
          successMessage = 'Question added successfully';
          break;
        case 'assignment':
          endpoint = '/assignments';
          data = {
            class_id: selectedClass,
            title: assignmentForm.title,
            description: assignmentForm.description,
            due_date: assignmentForm.due_date,
            total_points: assignmentForm.total_points,
            questions: assignmentForm.questions
          };
          successMessage = 'Assignment created successfully';
          break;
        case 'past-paper':
          endpoint = '/past-papers';
          data = {
            class_id: selectedClass,
            title: pastPaperForm.title,
            description: pastPaperForm.description,
            year: pastPaperForm.year,
            paper_url: pastPaperForm.paper_url
          };
          successMessage = 'Past paper added successfully';
          break;
        case 'video':
          endpoint = '/videos';
          data = {
            class_id: selectedClass,
            title: videoForm.title,
            description: videoForm.description,
            video_url: videoForm.video_url,
            duration: videoForm.duration
          };
          successMessage = 'Video added successfully';
          break;
        default:
          break;
      }

      await api.post(endpoint, data);
      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });
      fetchResources(selectedClass);
      handleCloseDialog();
      
      // Reset question form
      if (dialogType === 'question') {
        setQuestionForm({
          class_id: selectedClass,
          question_text: '',
          question_type: 'multiple_choice',
          points: 1,
          due_date: null,
          time_limit: 1,
          options: [{ option_text: '', is_correct: false }]
        });
      }
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

  // Columns for DataGrid with delete actions
  const questionColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'question_text', headerName: 'Question', flex: 1 },
    { field: 'question_type', headerName: 'Type', width: 150 },
    { field: 'points', headerName: 'Points', width: 100 },
    { 
      field: 'due_date', 
      headerName: 'Due Date', 
      width: 180,
      renderCell: (params) => (
        params.value ? 
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
            {new Date(params.value).toLocaleString()}
          </Box> : 
          'None'
      )
    },
    { 
      field: 'time_limit', 
      headerName: 'Time Limit', 
      width: 120,
      renderCell: (params) => (
        params.value ? 
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimeIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
            {`${params.value} min`}
          </Box> : 
          'Due Date'
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDeleteConfirmation('question', params.row.id, params.row.question_text)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  const assignmentColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'due_date', headerName: 'Due Date', width: 120 },
    { field: 'total_points', headerName: 'Points', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDeleteConfirmation('assignment', params.row.id, params.row.title)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  const pastPaperColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'year', headerName: 'Year', width: 100 },
    { 
      field: 'paper_url', 
      headerName: 'Link', 
      width: 150,
      renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          View Paper
        </a>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDeleteConfirmation('pastPaper', params.row.id, params.row.title)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  const videoColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { 
      field: 'video_url', 
      headerName: 'Link', 
      width: 150,
      renderCell: (params) => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          Watch Video
        </a>
      )
    },
    { field: 'duration', headerName: 'Duration (min)', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDeleteConfirmation('video', params.row.id, params.row.title)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Class Resources
        </Typography>

        {showClassSelection ? (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select a Class
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {classes.map(cls => (
                <Paper 
                  key={cls.id} 
                  sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={() => handleClassSelect(cls.id)}
                >
                  <Typography variant="subtitle1">{cls.className}</Typography>
                  <Typography variant="body2">Grade: {cls.grade}</Typography>
                  <Typography variant="body2">Subject: {cls.subject}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button onClick={handleBackToClassSelection} variant="outlined">
                Back to Class Selection
              </Button>
              <Typography variant="h6">
                {classes.find(c => c.id === selectedClass)?.className || 'Selected Class'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Add {activeTab === 0 ? 'Question' : 
                     activeTab === 1 ? 'Assignment' : 
                     activeTab === 2 ? 'Past Paper' : 'Video'}
              </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="resource tabs">
                <Tab label="Questions" icon={<QuizIcon />} iconPosition="start" />
                <Tab label="Assignments" icon={<AssignmentIcon />} iconPosition="start" />
                <Tab label="Past Papers" icon={<DescriptionIcon />} iconPosition="start" />
                <Tab label="Videos" icon={<VideoIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Resources Tables */}
            <Paper sx={{ p: 2 }}>
              {activeTab === 0 && (
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={resources.questions}
                    columns={questionColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    loading={loading}
                    disableSelectionOnClick
                  />
                </div>
              )}
              {activeTab === 1 && (
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={resources.assignments}
                    columns={assignmentColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    loading={loading}
                    disableSelectionOnClick
                  />
                </div>
              )}
              {activeTab === 2 && (
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={resources.pastPapers}
                    columns={pastPaperColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    loading={loading}
                    disableSelectionOnClick
                  />
                </div>
              )}
              {activeTab === 3 && (
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={resources.videos}
                    columns={videoColumns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    loading={loading}
                    disableSelectionOnClick
                  />
                </div>
              )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this {deleteItem.type}?
                </Typography>
                {deleteItem.title && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    "{deleteItem.title}"
                  </Typography>
                )}
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                <Button 
                  onClick={handleDeleteResource} 
                  color="error" 
                  variant="contained"
                  disabled={loading}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add Resource Dialogs */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle>
                Add {dialogType === 'question' ? 'Question' : 
                     dialogType === 'assignment' ? 'Assignment' : 
                     dialogType === 'past-paper' ? 'Past Paper' : 'Video'}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">
                    Class: {classes.find(c => c.id === selectedClass)?.className || ''}
                  </Typography>
                </Box>

                {dialogType === 'question' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                      label="Question Text"
                      name="question_text"
                      value={questionForm.question_text}
                      onChange={handleQuestionChange}
                      fullWidth
                      multiline
                      rows={3}
                      required
                    />
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        select
                        label="Question Type"
                        name="question_type"
                        value={questionForm.question_type}
                        onChange={handleQuestionTypeChange}
                        fullWidth
                        required
                      >
                        {questionTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      
                      <TextField
                        label="Points"
                        name="points"
                        type="number"
                        value={questionForm.points}
                        onChange={handleQuestionChange}
                        fullWidth
                        required
                      />
                    </Box>

                    <DateTimePicker
                      label="Due Date"
                      value={questionForm.due_date}
                      onChange={(newValue) => {
                        setQuestionForm(prev => ({ ...prev, due_date: newValue }));
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />

                    {questionForm.question_type === 'multiple_choice' && (
                      <>
                        <TextField
                          label="Time Limit (minutes)"
                          name="time_limit"
                          type="number"
                          value={questionForm.time_limit}
                          onChange={handleQuestionChange}
                          fullWidth
                          InputProps={{
                            startAdornment: <TimeIcon sx={{ mr: 1, color: 'action.active' }} />,
                          }}
                          required
                          inputProps={{ min: 1 }}
                        />

                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle1">Options</Typography>
                          {questionForm.options.map((option, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                              <TextField
                                label={`Option ${index + 1}`}
                                name="option_text"
                                value={option.option_text}
                                onChange={(e) => handleOptionChange(index, e)}
                                fullWidth
                                required
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
                                <input
                                  type="checkbox"
                                  name="is_correct"
                                  checked={option.is_correct}
                                  onChange={(e) => handleOptionChange(index, e)}
                                  style={{ marginRight: 8 }}
                                />
                                <Typography variant="body2">Correct</Typography>
                              </Box>
                              <IconButton onClick={() => removeOption(index)}>
                                <DeleteIcon color="error" />
                              </IconButton>
                            </Box>
                          ))}
                          <Button onClick={addOption} variant="outlined" size="small">
                            Add Option
                          </Button>
                        </Box>
                      </>
                    )}
                  </Box>
                )}

                {dialogType === 'assignment' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                      label="Title"
                      name="title"
                      value={assignmentForm.title}
                      onChange={handleAssignmentChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Description"
                      name="description"
                      value={assignmentForm.description}
                      onChange={handleAssignmentChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                    <TextField
                      label="Due Date"
                      name="due_date"
                      type="datetime-local"
                      value={assignmentForm.due_date}
                      onChange={handleAssignmentChange}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                    <TextField
                      label="Total Points"
                      name="total_points"
                      type="number"
                      value={assignmentForm.total_points}
                      onChange={handleAssignmentChange}
                      fullWidth
                    />
                  </Box>
                )}

                {dialogType === 'past-paper' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                      label="Title"
                      name="title"
                      value={pastPaperForm.title}
                      onChange={handlePastPaperChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Description"
                      name="description"
                      value={pastPaperForm.description}
                      onChange={handlePastPaperChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                    <TextField
                      label="Year"
                      name="year"
                      type="number"
                      value={pastPaperForm.year}
                      onChange={handlePastPaperChange}
                      fullWidth
                    />
                    <TextField
                      label="Paper URL"
                      name="paper_url"
                      value={pastPaperForm.paper_url}
                      onChange={handlePastPaperChange}
                      fullWidth
                      required
                      placeholder="https://example.com/past-paper.pdf"
                    />
                  </Box>
                )}

                {dialogType === 'video' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                      label="Title"
                      name="title"
                      value={videoForm.title}
                      onChange={handleVideoChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Description"
                      name="description"
                      value={videoForm.description}
                      onChange={handleVideoChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                    <TextField
                      label="Video URL"
                      name="video_url"
                      value={videoForm.video_url}
                      onChange={handleVideoChange}
                      fullWidth
                      required
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <TextField
                      label="Duration (minutes)"
                      name="duration"
                      type="number"
                      value={videoForm.duration}
                      onChange={handleVideoChange}
                      fullWidth
                    />
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button 
                  onClick={handleSubmit} 
                  variant="contained"
                  disabled={loading}
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

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
    </LocalizationProvider>
  );
};

export default ClassResources;