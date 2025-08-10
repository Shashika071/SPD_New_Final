import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css';

import { Badge, Button, Container, Form, Modal, Nav, Navbar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';

import { assest } from '../../assest/assest';
import axios from 'axios';

const CustomNavbar = ({ isHomePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Check if the user is logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle scroll event and update navbar background color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 0.2) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = (path) => {
    if (path.startsWith("#")) {
      window.location.href = path;
    } else {
      navigate(path);
    }
    setIsMenuOpen(false);
  };

  const handleButtonClick = () => {
    setShowModal(true);
    navigate('/')
  };

  const closeModal = () => {
    setShowModal(false);
    setIsLogin(true); // Reset to login form
  };

  const handleAuthFormSwitch = () => {
    setIsLogin(!isLogin);
  };

  // Handle Login
  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/user/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        closeModal();
        window.location.reload(); // Refresh the page after login
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (name, email, password, phone,parentPhone) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/user/register', { name, email, password, phone,parentPhone });
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        closeModal();
        window.location.reload(); // Refresh the page after signup
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (isLogin) {
      handleLogin(email, password);
    } else {
      const name = e.target.name.value;
      const phone = e.target.phone.value;
      const parentPhone = e.target.parentPhone.value;
      handleSignup(name, email, password, phone,parentPhone);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsDropdownOpen(false);
    window.location.reload(); // Refresh the page after logout
  };

  const handleImageClick = (image) => {
    if (image === 'td2') {
      navigate('/cart');
    }
  };

  // Handle dropdown hover with delay
  const handleDropdownEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300); // 300ms delay before hiding
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Navbar
        bg={scrolling ? 'dark' : isHomePage ? 'transparent' : 'dark'}
        variant="dark"
        expand="lg"
        className={`custom-navbar fixed-top shadow-sm ${scrolling ? 'navbar-scrolled' : ''}`}
        style={{
          transition: 'all 0.3s ease',
          backdropFilter: scrolling ? 'blur(10px)' : 'none',
          backgroundColor: scrolling ? 'rgba(33, 37, 41, 0.95)' : (isHomePage ? 'transparent' : 'rgba(33, 37, 41, 1)')
        }}
      >
        <Container fluid className="px-lg-5">
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img
              src={assest.expo}
              width="280"
              height="60"
              alt="Logo"
              className="img-fluid"
              style={{ transition: 'all 0.3s ease' }}
            />
          </Navbar.Brand>

          <Navbar.Toggle 
            aria-controls="basic-navbar-nav" 
            onClick={handleToggle}
            className="border-0 shadow-none"
          />
          
          <Navbar.Collapse id="basic-navbar-nav" in={isMenuOpen}>
            <Nav className="mx-auto custom-nav">
              <Nav.Link 
                onClick={() => handleLinkClick('#home')}
                className="nav-link-custom mx-2 px-3 py-2 rounded-pill"
              >
                <i className="fas fa-home me-2"></i>Home
              </Nav.Link>
              <Nav.Link 
                onClick={() => handleLinkClick('#courses')}
                className="nav-link-custom mx-2 px-3 py-2 rounded-pill"
              >
                <i className="fas fa-cogs me-2"></i>Courses
              </Nav.Link>
              <Nav.Link 
                onClick={() => handleLinkClick('#footer')}
                className="nav-link-custom mx-2 px-3 py-2 rounded-pill"
              >
                <i className="fas fa-envelope me-2"></i>Contact
              </Nav.Link>
              <Nav.Link 
                onClick={() => handleLinkClick('#about')}
                className="nav-link-custom mx-2 px-3 py-2 rounded-pill"
              >
                <i className="fas fa-info-circle me-2"></i>About
              </Nav.Link>
            </Nav>

            <div className="d-flex align-items-center gap-3">
              {!isAuthenticated && (
                <Button 
                  variant="outline-light" 
                  onClick={handleButtonClick}
                  className="btn-custom px-4 py-2 rounded-pill border-2"
                  style={{
                    transition: 'all 0.3s ease',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-user me-2"></i>Login / Sign Up
                </Button>
              )}
              
              {isAuthenticated && (
                <div className="d-flex align-items-center gap-2">
                  <div 
                    className="position-relative dropdown-container"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <img
                      className="btn-e-magazine-ms-lg-3 rounded-circle border border-2 border-light"
                      src={assest.td}
                      alt="Profile"
                      width="45"
                      height="45"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        objectFit: 'cover'
                      }}
                    />
                    <Badge 
                      bg="success" 
                      className="position-absolute top-0 start-100 translate-middle p-1 rounded-circle"
                      style={{ width: '12px', height: '12px' }}
                    >
                      <span className="visually-hidden">Online</span>
                    </Badge>
                    
                    <div 
                      ref={dropdownRef} 
                      className={`dropdown-menu-custom position-absolute ${isDropdownOpen ? 'show' : ''}`}
                      style={{
                        top: '100%',
                        right: '0',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        border: '1px solid #e9ecef',
                        minWidth: '200px',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="p-3 bg-light border-bottom">
                        <div className="d-flex align-items-center">
                          <img
                            src={assest.td}
                            alt="Profile"
                            width="40"
                            height="40"
                            className="rounded-circle me-3"
                            style={{ objectFit: 'cover' }}
                          />
                          <div>
                            <h6 className="mb-0 text-dark">Welcome Back!</h6>
                            <small className="text-muted">Manage your account</small>
                          </div>
                        </div>
                      </div>
                      
                      <div className="dropdown-item-custom d-flex align-items-center px-3 py-2 text-dark" 
                           onClick={() => {
                             navigate('/profile');
                             setIsDropdownOpen(false);
                           }}
                           style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        <i className="fas fa-user-circle me-3 text-primary"></i>
                        <span>My Profile</span>
                      </div>
                      
                      <div className="dropdown-item-custom d-flex align-items-center px-3 py-2 text-dark" 
                           onClick={() => {
                             navigate('/dashboard/my-classes');
                             setIsDropdownOpen(false);
                           }}
                           style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        <i className="fas fa-tachometer-alt me-3 text-info"></i>
                        <span>My Dashboard</span>
                      </div>
                      
                      <div className="border-top">
                        <div className="dropdown-item-custom d-flex align-items-center px-3 py-2 text-danger" 
                             onClick={() => {
                               handleLogout();
                               setIsDropdownOpen(false);
                             }}
                             style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          <i className="fas fa-sign-out-alt me-3"></i>
                          <span>Logout</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {isMenuOpen && (
        <div 
          className="overlay position-fixed w-100 h-100"
          onClick={handleToggle}
          style={{
            top: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
            backdropFilter: 'blur(2px)'
          }}
        ></div>
      )}

      {/* Enhanced Login/Signup Modal */}
      <Modal 
        show={showModal} 
        onHide={closeModal} 
        centered 
        size="md"
        className="auth-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="w-100 text-center">
            <div className="d-flex justify-content-center align-items-center mb-3">
              <div className="bg-primary rounded-circle p-3 me-3">
                <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} text-white`}></i>
              </div>
              <h4 className="mb-0">{isLogin ? 'Welcome Back!' : 'Join Us Today!'}</h4>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="px-4 pb-4">
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              {!isLogin && (
                <div className="col-12">
                  <Form.Group controlId="formName">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-user me-2"></i>Full Name
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      placeholder="Enter your full name" 
                      required 
                      className="form-control-lg rounded-pill px-4"
                    />
                  </Form.Group>
                </div>
              )}
              
              <div className="col-12">
                <Form.Group controlId="formEmail">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-envelope me-2"></i>Email Address
                  </Form.Label>
                  <Form.Control 
                    type="email" 
                    name="email" 
                    placeholder="Enter your email address" 
                    required 
                    className="form-control-lg rounded-pill px-4"
                  />
                </Form.Group>
              </div>
              
              <div className="col-12">
                <Form.Group controlId="formPassword">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-lock me-2"></i>Password
                  </Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password" 
                    placeholder="Enter your password" 
                    required 
                    className="form-control-lg rounded-pill px-4"
                  />
                </Form.Group>
              </div>
              
              {!isLogin && (
                <div className="col-12">
                  <Form.Group controlId="formTelNum">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-phone me-2"></i>Phone Number
                    </Form.Label>
                    <Form.Control 
                      type="tel" 
                      name="phone" 
                      placeholder="Enter your phone number" 
                      required 
                      className="form-control-lg rounded-pill px-4"
                    />
                  </Form.Group>
                  <div className="col-12">
                <Form.Group controlId="formTelNum">
                  <Form.Label className="fw-semibold">
                    <i className="fas fa-envelope me-2"></i>Parent Phone
                  </Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="parentPhone" 
                    placeholder="Enter your Parent phone number" 
                    required 
                    className="form-control-lg rounded-pill px-4"
                  />
                </Form.Group>
              </div>
                </div>
                
              )}
            </div>
            
            <div className="d-grid gap-2 mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                className="rounded-pill fw-semibold py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-muted mb-2">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button 
                variant="link" 
                onClick={handleAuthFormSwitch} 
                className="text-decoration-none fw-semibold p-0"
              >
                {isLogin ? 'Create Account' : 'Sign In Instead'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <style jsx>{`
        .nav-link-custom {
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .nav-link-custom:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        .btn-custom:hover {
          background-color: white;
          color: #212529;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }
        
        .dropdown-item-custom:hover {
          background-color: #f8f9fa;
        }
        
        .navbar-scrolled {
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .auth-modal .modal-content {
          border: none;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
};

export default CustomNavbar;