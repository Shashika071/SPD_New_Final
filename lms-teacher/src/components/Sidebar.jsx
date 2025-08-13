import {
  Analytics as AnalyticsIcon,
  ChevronLeft,
  ChevronRight,
  Dashboard as DashboardIcon,
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  People as PeopleIcon,
  Inventory as ProductsIcon,
  AccountCircle as ProfileIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  alpha,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import axios from 'axios';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: theme.palette.background.default,
    borderRight: 'none',
    backgroundImage: 'linear-gradient(to bottom, #3a4b6d, #2c3a5a)',
    color: theme.palette.common.white,
  },
}));

const StyledListItem = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  padding: theme.spacing(1, 2),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.1),
  },
  ...(selected && {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  }),
}));

function Sidebar({ mobileOpen, handleDrawerToggle }) {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const mainMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Class Management', icon: <EventNoteIcon />, path: '/admin/classManagement' },
    { text: 'Class Resources', icon: <MenuBookIcon />, path: '/admin/classResources' },
    { text: 'Quiz Management', icon: <MenuBookIcon />, path: '/admin/QuizManagement' },
  ];

  const reportsMenu = [
    { text: 'Sales', icon: <AnalyticsIcon />, path: '/admin/reports/sales' },
    { text: 'Traffic', icon: <AnalyticsIcon />, path: '/admin/reports/traffic' },
  ];

  useEffect(() => {
    const fetchTeacherData = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:4000/api/teachers/get_guide', {
          headers: { token }
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

  const handleClick = () => {
    setOpen(!open);
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
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
        handleProfileClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  return (
    <Box component="nav">
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={1}>
           
            <Typography variant="h6" noWrap>
              Teacher Panel
            </Typography>
          </Box>
          <IconButton onClick={handleDrawerToggle} color="inherit">
            {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Toolbar>
        
        <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />

        {/* Teacher Profile */}
        <Box p={2} textAlign="center">
          <label htmlFor="sidebar-profile-upload">
            <Avatar 
              src={teacherData?.profileImage ? `http://localhost:4000/images/${teacherData.profileImage}` : undefined}
              sx={{ 
                width: 64, 
                height: 64, 
                margin: '0 auto 8px',
                border: `2px solid ${theme.palette.primary.main}`,
                cursor: 'pointer',
                '&:hover': {
                  opacity: 0.8
                }
              }}
              onClick={handleProfileOpen}
            />
          </label>
          <input
            key={fileInputKey}
            id="sidebar-profile-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {!loading && teacherData && (
            <>
              <Typography variant="subtitle1">{teacherData.name}</Typography>
              <Typography variant="body2" sx={{ color: alpha(theme.palette.common.white, 0.7) }}>
                {teacherData.email}
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1, color: 'white', borderColor: 'white' }}
                onClick={handleProfileOpen}
                startIcon={<ProfileIcon />}
              >
                View Profile
              </Button>
            </>
          )}
        </Box>

        <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />

        {/* Main Menu */}
        <List>
          {mainMenu.map((item) => (
            <ListItem key={item.text} disablePadding>
              <StyledListItem
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </StyledListItem>
            </ListItem>
          ))}
        </List>

        {/* Collapsible Reports Section */}
        <ListItemButton onClick={handleClick}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
            <AnalyticsIcon />
          </ListItemIcon>
          <ListItemText primary="Reports" />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {reportsMenu.map((item) => (
              <ListItem key={item.text} disablePadding>
                <StyledListItem
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </StyledListItem>
              </ListItem>
            ))}
          </List>
        </Collapse>

        {/* Settings Section */}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.1) }} />
          <List>
            <ListItem disablePadding>
              <StyledListItem
                component={Link}
                to="/admin/settings"
                selected={location.pathname === '/admin/settings'}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </StyledListItem>
            </ListItem>
          </List>
        </Box>
      </StyledDrawer>

      {/* Profile Dialog */}
      <Dialog open={profileOpen} onClose={handleProfileClose}>
        <DialogTitle>Teacher Profile</DialogTitle>
        <DialogContent>
          {teacherData && (
            <Box sx={{ p: 2, minWidth: 300 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3, 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}>
                <label htmlFor="dialog-profile-upload">
                  <Avatar
                    src={teacherData.profileImage ? `http://localhost:4000/images/${teacherData.profileImage}` : undefined}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  />
                </label>
                <input
                  key={fileInputKey}
                  id="dialog-profile-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => document.getElementById('dialog-profile-upload').click()}
                >
                  Change Profile Picture
                </Button>
              </Box>
              <List>
                <ListItem>
                  <ListItemText primary="Name" secondary={teacherData.name} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Email" secondary={teacherData.email} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Phone" secondary={teacherData.phone} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="NIC" secondary={teacherData.nic} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Highest Qualification" 
                    secondary={teacherData.highest_qualification} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Degrees" 
                    secondary={teacherData.degrees?.join(', ') || 'None'} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Diplomas" 
                    secondary={teacherData.diplomas?.join(', ') || 'None'} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Specialization" 
                    secondary={teacherData.specialization} 
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText 
                    primary="Experience" 
                    secondary={`${teacherData.experience_years} years`} 
                  />
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Sidebar;