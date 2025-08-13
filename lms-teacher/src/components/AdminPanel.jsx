import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CssBaseline,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useState } from 'react';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Outlet } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 280; // Increased for better spacing

function AdminPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleUserMenuClose();
    navigate('/admin/profile');
  };

  const handleSettings = () => {
    handleUserMenuClose();
    navigate('/admin/settings');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser?.email) return 'AD';
    const parts = currentUser.email.split('@')[0].split('.');
    if (parts.length > 1) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return currentUser.email.substring(0, 2).toUpperCase();
  };

  // Get user role/type
  const getUserRole = () => {
    return currentUser?.role || 'Teacher';
  };

  // Mock notifications - replace with real data
  const notifications = [
    { id: 1, message: 'New student enrollment', time: '5 min ago', type: 'info' },
    { id: 2, message: 'Assignment due tomorrow', time: '1 hour ago', type: 'warning' },
    { id: 3, message: 'System update completed', time: '2 hours ago', type: 'success' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Enhanced App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          background: alpha(theme.palette.background.paper, 0.95),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Left Side - Mobile Menu & Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2, 
                display: { md: 'none' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            
            {/* Page Title - Dynamic based on route */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon sx={{ color: theme.palette.primary.main }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Teacher Dashboard
              </Typography>
            </Box>
          </Box>

          {/* Right Side - User Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* User Role Chip */}
            <Chip
              label={getUserRole()}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                fontWeight: 500
              }}
            />

            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleNotificationMenuOpen}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Welcome back
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser?.email }
                </Typography>
              </Box>
              
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ 
                    p: 0.5,
                    '&:hover': {
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                      }
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            You have {notifications.length} new notifications
          </Typography>
        </Box>
        <Divider />
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleNotificationMenuClose}
            sx={{ 
              py: 1.5, 
              px: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem 
          onClick={handleNotificationMenuClose}
          sx={{ 
            justifyContent: 'center',
            color: theme.palette.primary.main,
            fontWeight: 500
          }}
        >
          View All Notifications
        </MenuItem>
      </Menu>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            width: 200,
            mt: 1,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          
        
        </Box>
        <Divider />
        <Divider />
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1,
            color: theme.palette.error.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.error.main, 0.1)
            }
          }}
        >
          <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Enhanced Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          position: 'relative'
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar />
        
        {/* Content Container */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: '100%',
            mx: 'auto'
          }}
        >
          {/* Content Paper Wrapper */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
              minHeight: 'calc(100vh - 120px)', // Responsive height
              position: 'relative'
            }}
          >
            {/* This Outlet will render the matched child route component */}
            <Outlet />
          </Paper>
        </Box>
        
        {/* Footer */}
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            mt: 'auto'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2024 Teacher Dashboard. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminPanel;