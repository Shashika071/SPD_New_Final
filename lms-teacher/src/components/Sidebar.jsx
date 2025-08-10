import './Sidebar.css';

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import axios from 'axios';

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));  
  const [open, setOpen] = useState(false);  
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const navigate = useNavigate();  
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const fileInputRef = React.useRef();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleProfileModalOpen = () => {
    setProfileModalOpen(true);
  };

  const handleProfileModalClose = () => {
    setProfileModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_image', file);
    formData.append('userId', teacherData.id);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:4000/api/teachers/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          token: token
        }
      });

      if (response.data.success) {
        setTeacherData(response.data.teacher);
        setFileInputKey(Date.now());
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      const token = localStorage.getItem('token'); 
      try {
        const response = await axios.get('http://localhost:4000/api/teachers/get_guide', {
          headers: {
            token: token
          }
        });
        setTeacherData(response.data.teacher);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setLoading(false);
      }
    };
  
    fetchTeacherData();
  }, []);

  return (
    <Box>
      {isMobile && (
        <AppBar position="sticky">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">Tour Management</Typography>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#333',  
            color: 'white',
            paddingTop: '20px',
          },
        }}
        variant={isMobile ? 'temporary' : 'permanent'}
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true,  
        }}
      >
        {/* Profile Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            padding: '10px', 
            marginBottom: '20px', 
            position: 'relative',
            cursor: 'pointer'
          }}
          onClick={handleProfileModalOpen}
        >
          {loading ? (
            <CircularProgress sx={{ color: 'white', mt: 1 }} size={20} />
          ) : (
            <>
              <input
                type="file"
                ref={fileInputRef}
                key={fileInputKey}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'gray', 
                    width: '100px', 
                    height: '100px', 
                    margin: '0 auto',
                    cursor: 'pointer'
                  }}
                  src={teacherData?.profileImage ? `http://localhost:4000/images/${teacherData.profileImage}` : undefined}
                  onClick={triggerFileInput}
                >
                  {!teacherData?.profileImage && <PersonIcon sx={{ fontSize: '50px' }} />}
                </Avatar>
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: '25%',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  onClick={triggerFileInput}
                >
                  <CloudUploadIcon sx={{ fontSize: '20px', color: 'white' }} />
                </IconButton>
              </Box>
              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600, mt: 1 }}>
                {teacherData?.name || 'Guest User'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'lightgray' }}>
                {teacherData?.email}
              </Typography>
              <Typography variant="caption" sx={{ color: 'lightgray', display: 'block', mt: 1 }}>
                {teacherData?.specialization}
              </Typography>
            </>
          )}
        </Box>

        <List>

          <Divider sx={{ bgcolor: 'white' }} />
           <ListItem button component={Link} to="/class-management">
            <ListItemIcon>
              <PeopleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Class Management" />
          </ListItem>
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/add-resources">
            <ListItemIcon>
              <PersonAddIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Class Resources" />
          </ListItem>
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/add-material">
            <ListItemIcon>
              <AddCircleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Add Material" />
          </ListItem>
          
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/list-material">
            <ListItemIcon>
              <FormatListBulletedIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="List Material" />
          </ListItem>
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/Add-employee">
            <ListItemIcon>
              <PersonAddIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Add Employee" />
          </ListItem>
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/list-employee">
            <ListItemIcon>
              <PeopleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="List Employee" />
          </ListItem>
          
          <Divider sx={{ bgcolor: 'white' }} />
          <ListItem button component={Link} to="/List-machine">
            <ListItemIcon>
              <PeopleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="List Machine" />
          </ListItem>
          <Divider sx={{ bgcolor: 'white' }} />
          
        </List>

        <Box sx={{ position: 'absolute', bottom: '20px', width: '80%', left: '10px', backgroundColor: 'green', borderRadius: '10px' }}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogout}
            startIcon={<ExitToAppIcon />}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Profile Details Modal */}
      <Dialog
        open={profileModalOpen}
        onClose={handleProfileModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Teacher Profile</DialogTitle>
        <DialogContent>
  {teacherData && (
    <Paper className="profile-card">
      <Box className="avatar-container">
        <Avatar 
          sx={{ 
            width: 120, 
            height: 120,
            bgcolor: 'primary.main',
            fontSize: '3rem'
          }}
          src={teacherData.profileImage ? `http://localhost:4000/images/${teacherData.profileImage}` : undefined}
        >
          {!teacherData.profileImage && 
            <PersonIcon sx={{ fontSize: '60px' }} />
          }
        </Avatar>
      </Box>
      
      <Typography className="teacher-name" variant="h5" gutterBottom>
        {teacherData.name}
      </Typography>
      
      <Typography className="teacher-email" variant="subtitle1" gutterBottom>
        {teacherData.email}
      </Typography>
      
      <Divider className="divider" />
      
      <Box className="qualifications-section">
        <Box className="detail-row">
          <BadgeIcon />
          <Typography variant="body1">
            <strong>NIC:</strong> {teacherData.nic}
          </Typography>
        </Box>
        
        <Box className="detail-row">
          <SchoolIcon />
          <Typography variant="body1">
            <strong>Highest Qualification:</strong> {teacherData.highest_qualification}
          </Typography>
        </Box>
        
        <Box className="detail-row">
          <WorkHistoryIcon />
          <Typography variant="body1">
            <strong>Experience:</strong> {teacherData.experience_years} years
          </Typography>
        </Box>
      </Box>
      
      <Divider className="divider" />
      
      <Box sx={{ mt: 2 }}>
        <Typography className="section-title">
          <SchoolIcon sx={{ mr: 1 }} />
          Degrees
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {teacherData.degrees && teacherData.degrees.length > 0 ? (
            teacherData.degrees.map((degree, index) => (
              <Chip 
                key={index} 
                label={degree} 
                color="primary" 
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No degrees added
            </Typography>
          )}
        </Stack>
      </Box>
      
      <Box sx={{ mt: 3 }}>
        <Typography className="section-title">
          <SchoolIcon sx={{ mr: 1 }} />
          Diplomas
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {teacherData.diplomas && teacherData.diplomas.length > 0 ? (
            teacherData.diplomas.map((diploma, index) => (
              <Chip 
                key={index} 
                label={diploma} 
                color="secondary" 
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No diplomas added
            </Typography>
          )}
        </Stack>
      </Box>
      
      <Divider className="divider" sx={{ mt: 3 }} />
      
      <Typography variant="caption" color="text.secondary">
        Member since: {new Date(teacherData.joinDate).toLocaleDateString()}
      </Typography>
    </Paper>
  )}
</DialogContent>
        <DialogActions>
          <Button onClick={handleProfileModalClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ marginLeft: isMobile ? 0 : 240, transition: 'margin 0.3s' }}>
      </Box>
    </Box>
  );
};

export default Sidebar;