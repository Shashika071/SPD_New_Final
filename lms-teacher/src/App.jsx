import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Box,
  CircularProgress,
  Toolbar,
  Typography
} from '@mui/material';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation
} from 'react-router-dom';

import AdminPanel from './components/AdminPanel';
import ClassManagement from "./components/ClassManagement";
import ClassResources from "./components/ClassResources";
import LoginSignup from "./components/LoginSignup";
import Users from './components/Users';
import { useTheme } from '@mui/material/styles';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route index element={<DashboardContent />} />
            <Route path="users" element={<Users />} />
            <Route path="classResources" element={<ClassResources />} />
            <Route path="classManagement" element={<ClassManagement />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children ? children : <AdminPanel />;
}

function DashboardContent() {
  const { currentUser } = useAuth();
  const theme = useTheme();

  return (
    <Box sx={{ 
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
      p: 3,
      boxShadow: theme.shadows[1]
    }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {currentUser?.email}
      </Typography>
      <Typography paragraph>
        This is your admin dashboard. You can manage all aspects of your application from here.
      </Typography>
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mt: 4
      }}>
        {[
          { title: 'Total Users', value: '1,234', change: '+12%' },
          { title: 'Revenue', value: '$34,567', change: '+8%' },
          { title: 'Products', value: '567', change: '+5%' },
          { title: 'Active Sessions', value: '89', change: '-3%' }
        ].map((card, index) => (
          <Box 
            key={index}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[100],
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {card.title}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {card.value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                color: card.change.startsWith('+') ? 
                  theme.palette.success.main : 
                  theme.palette.error.main 
              }}
            >
              {card.change} from last month
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default App;