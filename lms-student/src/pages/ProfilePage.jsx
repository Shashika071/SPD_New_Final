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
      background: 'linear-gradient(135deg,rgb(137, 156, 240) 0%,rgb(137, 156, 240))',
      minHeight: '80vh',
      paddingTop: '2rem',
      paddingBottom: '2rem',
      marginTop: '80px',
      borderRadius: '20px',
    }}>
      <Container>
        <Row className="justify-content-center">
          <Col lg={8} xl={6}>
            {alert && (
              <Alert 
                variant={alert.type} 
                onClose={() => setAlert(null)} 
                dismissible
                className="mb-4"
              >
                {alert.message}
              </Alert>
            )}

            <Card className="shadow-lg border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{
                background: 'linear-gradient(135deg,#764ba2 100% ,rgb(0, 0, 0) 100%)',
                height: '120px',
                position: 'relative',
              }}>
                <div className="d-flex justify-content-center align-items-end h-100 pb-3">
                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ borderRadius: '20px',marginBottom: '50px'}}>
                    <User size={16} className="me-2" />
                    My Profile
                  </Badge>
                </div>
              </div>

              <Card.Body className="text-center" style={{ marginTop: '-60px', paddingTop: '0' }}>
                <div className="position-relative d-inline-block mb-4">
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '4px solid white',
                    overflow: 'hidden',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    position: 'relative'
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
                           style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}>
                        <Spinner animation="border" size="sm" />
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="position-absolute"
                      style={{
                        bottom: '0',
                        right: '0',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        padding: '0',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }}
                      onClick={() => setIsEditing(true)}
                    >
                      <Camera size={16} />
                    </Button>
                  )}
                </div>

                {isEditing && (
                  <Card className="mb-4" style={{ borderRadius: '15px', border: '2px dashed #dee2e6' }}>
                    <Card.Body>
                      <Form onSubmit={handleProfileImageUpdate}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            <Camera size={16} className="me-2" />
                            Choose New Profile Image
                          </Form.Label>
                          <Form.Control 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            style={{ borderRadius: '10px' }}
                          />
                        </Form.Group>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant="success" 
                            type="submit" 
                            disabled={loading}
                            style={{ borderRadius: '10px' }}
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
                          >
                            <X size={16} className="me-2" />
                            Cancel
                          </Button>
                        </div>
                      </Form>
                    </Card.Body>
                  </Card>
                )}

                <div className="text-start">
                  <Row className="g-3">
                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#667eea',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <User size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Full Name</small>
                            <div className="fw-bold">{user.student_name || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#764ba2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Mail size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Email Address</small>
                            <div className="fw-bold">{user.email || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#28a745',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Phone size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Phone Number</small>
                            <div className="fw-bold">{user.phone || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#ffc107',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <PhoneCall size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Parent Phone</small>
                            <div className="fw-bold">{user.parent_phone || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#17a2b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Hash size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Student ID</small>
                            <div className="fw-bold">{user.student_id || 'Not provided'}</div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col md={6}>
                      <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '15px' }}>
                        <Card.Body className="d-flex align-items-center">
                          <div className="me-3">
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: '#fd7e14',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Calendar size={20} color="white" />
                            </div>
                          </div>
                          <div>
                            <small className="text-muted">Member Since</small>
                            <div className="fw-bold">{formatDate(user.registration_date)}</div>
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