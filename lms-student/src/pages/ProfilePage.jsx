import { Alert, Badge, Button, Card, Col, Container, Form, Image, Row, Spinner } from 'react-bootstrap';
import { Calendar, Camera, Edit3, Hash, Mail, Phone, PhoneCall, Save, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      axios.get(`http://localhost:4000/api/user/get_user`, {
        headers: { token },
      })
      .then((response) => {
        setUser(response.data.student);
        setImage(response.data.student?.profile_image || 'https://via.placeholder.com/150');
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        setAlert({ type: 'danger', message: 'Error fetching user data' });
        setLoading(false);
      });
    }
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileImageUpdate = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setAlert({ type: 'warning', message: 'Please select an image to upload.' });
      return;
    }

    const formData = new FormData();
    formData.append('profile_image', imageFile);
    formData.append('userId', jwtDecode(token).id);
    
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/user/update', formData, {
        headers: { token },
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Profile image updated successfully!' });
        setImage(response.data.profile_image);
        setIsEditing(false);
        const userResponse = await axios.get(`http://localhost:4000/api/user/get_user`, {
          headers: { token },
        });
        setUser(userResponse.data.student);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      setAlert({ type: 'danger', message: 'Error updating profile image' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #e9eaeeff 0%, #e3dee8ff 100%)',
      minHeight: '100vh',
      paddingTop: '5rem',
      paddingBottom: '2rem',
      marginTop: '0px',
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {alert && (
              <Alert 
                variant={alert.type} 
                onClose={() => setAlert(null)} 
                dismissible
                className="mb-4 shadow-sm"
                style={{ borderRadius: '15px' }}
              >
                {alert.message}
              </Alert>
            )}

            <Card className="shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              {/* Header Section */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                height: '150px',
                position: 'relative',
              }}>
                <div className="d-flex justify-content-center align-items-center h-100">
                  <Badge bg="light" text="dark" className="px-4 py-2" style={{ 
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    <User size={18} className="me-2" />
                    My Profile
                  </Badge>
                </div>
              </div>

              <Card.Body className="text-center p-4" style={{ marginTop: '-75px', paddingTop: '0' }}>
                {/* Profile Image Section */}
                <div className="position-relative d-inline-block mb-4">
                  <div style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    border: '5px solid white',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    position: 'relative',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <Image
                      src={image && image !== 'https://via.placeholder.com/150' 
                        ? (image.startsWith('data:') ? image : `http://localhost:4000/images/${image}`)
                        : image}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      alt="Profile"
                    />
                    {loading && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                           style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '50%' }}>
                        <Spinner animation="border" variant="primary" />
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="position-absolute shadow"
                      style={{
                        bottom: '10px',
                        right: '10px',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        padding: '0',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                      onClick={() => setIsEditing(true)}
                    >
                      <Camera size={18} />
                    </Button>
                  )}
                </div>

                {/* User Name */}
                <h3 className="mb-1" style={{ color: '#2c3e50', fontWeight: '700' }}>
                  {user.student_name || 'Welcome User'}
                </h3>
                <p className="text-muted mb-4">Student Profile</p>

                {/* Image Upload Section */}
                {isEditing && (
                  <Card className="mb-4 shadow-sm" style={{ 
                    borderRadius: '15px', 
                    border: '2px dashed #dee2e6',
                    backgroundColor: '#f8f9fa' 
                  }}>
                    <Card.Body>
                      <Form onSubmit={handleProfileImageUpdate}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold d-flex align-items-center justify-content-center">
                            <Camera size={16} className="me-2" />
                            Choose New Profile Image
                          </Form.Label>
                          <Form.Control 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            style={{ borderRadius: '10px' }}
                            className="shadow-sm"
                          />
                        </Form.Group>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant="success" 
                            type="submit" 
                            disabled={loading}
                            style={{ borderRadius: '10px' }}
                            className="shadow-sm"
                          >
                            {loading ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save size={16} className="me-2" />
                                Save Image
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setImageFile(null);
                              setImage(user.profile_image || 'https://via.placeholder.com/150');
                            }}
                            style={{ borderRadius: '10px' }}
                            className="shadow-sm"
                          >
                            <X size={16} className="me-2" />
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                {/* User Information Cards */}
                <div className="text-start">
                  <Row className="g-3">
                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(102, 126, 234, 0.3)'
                            }}>
                              <User size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Full Name</small>
                            <div className="fw-bold text-dark">{user.student_name || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(118, 75, 162, 0.3)'
                            }}>
                              <Mail size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Email Address</small>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.9rem', wordBreak: 'break-word' }}>
                              {user.email || 'Not provided'}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(40, 167, 69, 0.3)'
                            }}>
                              <Phone size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Phone Number</small>
                            <div className="fw-bold text-dark">{user.phone || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(255, 193, 7, 0.3)'
                            }}>
                              <PhoneCall size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Parent Phone</small>
                            <div className="fw-bold text-dark">{user.parent_phone || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #17a2b8 0%, #6610f2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(23, 162, 184, 0.3)'
                            }}>
                              <Hash size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Student ID</small>
                            <div className="fw-bold text-dark">{user.student_id || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0 shadow-sm" style={{ 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '15px',
                        transition: 'transform 0.2s ease-in-out'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <Card.Body className="d-flex align-items-center p-3">
                          <div className="me-3">
                            <div style={{
                              width: '45px',
                              height: '45px',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, #fd7e14 0%, #e83e8c 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 8px rgba(253, 126, 20, 0.3)'
                            }}>
                              <Calendar size={22} color="white" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <small className="text-muted fw-semibold">Member Since</small>
                            <div className="fw-bold text-dark">{formatDate(user.registration_date)}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProfilePage;