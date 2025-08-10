import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const Sidebar = () => {
  const [image, setImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  // Navigation items with icons
  const navItems = [
    { path: "/all-class", icon: "bi-collection-play", label: "All Classes" },
    { path: "/dashboard/my-classes", icon: "bi-journal-bookmark", label: "My Classes" },
    { path: "/dashboard/marks-predicator", icon: "bi-graph-up", label: "Grade Predictor" },
    { path: "/profile", icon: "bi-person-circle", label: "Profile" }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const goToHomePage = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/user/get_user', {
          headers: {
            token: token
          }
        });
        if (response.data.success) {
          setUser(response.data.student);
          setImage(response.data.student?.profile_image || 'https://via.placeholder.com/150');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      {/* Mobile Toggle Button */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary d-lg-none">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleSidebar}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </span>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`d-flex flex-column flex-shrink-0 p-3 text-white bg-dark position-fixed h-100 ${sidebarOpen ? 'show' : 'd-none d-lg-block'}`} 
           style={{ 
             width: '280px', 
             zIndex: 1000,
             background: 'linear-gradient(135deg, #1E3A8A 0%, #1E3A8A 100%)',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
             borderRadius: '0 5px 5px 0'
           }}>
        
        {/* Close button for mobile */}
        <div className="d-lg-none d-flex justify-content-end mb-3">
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            aria-label="Close"
            onClick={toggleSidebar}
          ></button>
        </div>

        {/* Profile Section */}
        <div className="text-center mb-4 p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '15px' }}>
          <div className="position-relative d-inline-block mb-3">
            <img 
              src={image && image !== 'https://via.placeholder.com/150' 
                ? `http://localhost:4000/images/${image}` 
                : image} 
              alt="Profile" 
              className="rounded-circle border border-3 border-white"
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
            />
            <span className="position-absolute bottom-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle">
              <span className="visually-hidden">Online</span>
            </span>
          </div>
          <h5 className="mb-1 fw-bold">{user.student_name || 'Guest User'}</h5>
          <p className="mb-0 text-white-50">
            <i className="bi bi-person-badge me-1"></i>Student
          </p>
        </div>

        {/* Navigation Menu */}
        <ul className="nav nav-pills flex-column mb-auto">
          {navItems.map((item, index) => (
            <li key={index} className="nav-item mb-2">
              <Link 
                to={item.path} 
                className="nav-link text-white d-flex align-items-center p-3 rounded"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.3s',
                  borderLeft: window.location.pathname === item.path ? '4px solid #fff' : 'none'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              >
                <i className={`bi ${item.icon} me-3 fs-5`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <hr className="text-white-50"/>

        {/* Home Page Button */}
        <div className="mt-auto">
          <button 
            className="btn btn-light btn-lg w-100 d-flex align-items-center justify-content-center"
            onClick={goToHomePage}
            style={{ 
              borderRadius: '10px', 
              fontWeight: 'bold',
              transition: 'all 0.3s',
              backgroundColor: '#f8f9fa',
              color: '#1E3A8A'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fff';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <i className="bi bi-house-fill me-2"></i>
            Home Page
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content wrapper */}
      <div className="d-none d-lg-block" style={{ marginLeft: '280px' }}>
        {/* Your main content goes here */}
      </div>
    </>
  );
};

export default Sidebar;