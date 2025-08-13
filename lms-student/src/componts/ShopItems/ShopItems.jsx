import './CourseCatalog.css';
import 'react-toastify/dist/ReactToastify.css';

import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FaArrowRight, FaBook, FaChalkboardTeacher, FaClock, FaGraduationCap, FaLaptopCode, FaStar, FaUserGraduate, FaUsers } from 'react-icons/fa';

import React from 'react';
import { assest } from '../../assest/assest';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CourseCatalog = () => {
  const navigate = useNavigate();

  const courses = [
    {
      name: 'Grade 10 English Class',
      image: assest.ten_end,
      description: 'Improve English grammar, writing, and reading skills tailored for Grade 10 students.',
      topics: ['Grammar', 'Reading Comprehension', 'Essay Writing', 'Vocabulary'],
      duration: '12 weeks',
      level: 'Grade 10',
      rating: 4.7,
      students: 900,
      category: 'English',
      link: '/courses/grade10-english'
    },
    {
      name: 'Grade 11 English Class',
      image: assest.eleven_end,
      description: 'Advanced English preparation for Grade 11 students including literature and writing.',
      topics: ['Literature Analysis', 'Advanced Grammar', 'Creative Writing', 'Exam Practice'],
      duration: '12 weeks',
      level: 'Grade 11',
      rating: 4.8,
      students: 1100,
      category: 'English',
      link: '/courses/grade11-english'
    },
    {
      name: 'Grade 10 Mathematics Class',
      image: assest.ten_math,
      description: 'Master mathematical concepts including algebra and geometry for Grade 10.',
      topics: ['Algebra', 'Geometry', 'Mensuration', 'Basic Trigonometry'],
      duration: '12 weeks',
      level: 'Grade 10',
      rating: 4.6,
      students: 980,
      category: 'Mathematics',
      link: '/courses/grade10-maths'
    },
    {
      name: 'Grade 11 Mathematics Class',
      image: assest.eleven_end,
      description: 'Prepare for advanced mathematical concepts like calculus and statistics in Grade 11.',
      topics: ['Trigonometry', 'Calculus Basics', 'Statistics', 'Functions'],
      duration: '12 weeks',
      level: 'Grade 11',
      rating: 4.9,
      students: 1150,
      category: 'Mathematics',
      link: '/courses/grade11-maths'
    },
    {
      name: 'Grade 10 Commerce Class',
      image: assest.ten_com,
      description: 'Learn the fundamentals of commerce, trade, and business for Grade 10.',
      topics: ['Introduction to Commerce', 'Basic Accounting', 'Trade', 'Banking'],
      duration: '12 weeks',
      level: 'Grade 10',
      rating: 4.5,
      students: 870,
      category: 'Commerce',
      link: '/courses/grade10-commerce'
    },
    {
      name: 'Grade 11 Commerce Class',
      image: assest.eleven_com,
      description: 'Advanced commerce concepts including business environment and financial literacy.',
      topics: ['Business Studies', 'Accounting', 'Economics Basics', 'Entrepreneurship'],
      duration: '12 weeks',
      level: 'Grade 11',
      rating: 4.7,
      students: 960,
      category: 'Commerce',
      link: '/courses/grade11-commerce'
    }
  ];

  const features = [
    {
      icon: <FaChalkboardTeacher className="feature-icon" />,
      title: 'Expert Instructors',
      description: 'Learn from industry professionals and academic experts with years of real-world experience.',
      color: 'primary'
    },
    {
      icon: <FaLaptopCode className="feature-icon" />,
      title: 'Interactive Learning',
      description: 'Engaging content with hands-on projects, live coding sessions, and practical exercises.',
      color: 'success'
    },
    {
      icon: <FaBook className="feature-icon" />,
      title: 'Comprehensive Resources',
      description: 'Access to extensive learning materials, e-books, videos, and reference guides.',
      color: 'info'
    },
    {
      icon: <FaUserGraduate className="feature-icon" />,
      title: 'Personalized Paths',
      description: 'Customized learning journeys based on your goals, pace, and skill level.',
      color: 'warning'
    },
    {
      icon: <FaGraduationCap className="feature-icon" />,
      title: 'Certification',
      description: 'Earn recognized certificates upon completion to boost your professional credentials.',
      color: 'danger'
    },
    {
      icon: <FaUsers className="feature-icon" />,
      title: 'Community Support',
      description: 'Connect with peers and mentors in our vibrant learning community and forums.',
      color: 'secondary'
    }
  ];

  const getLevelBadgeVariant = (level) => {
    switch(level) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'info';
    }
  };

  const getCategoryBadgeVariant = (category) => {
    switch(category) {
      case 'Technology': return 'primary';
      case 'Business': return 'info';
      case 'Marketing': return 'warning';
      case 'Design': return 'danger';
      case 'Career': return 'secondary';
      default: return 'dark';
    }
  };

  const handleEnrollClick = () => {
    const token = localStorage.getItem('token');
   
    if (token) {
      navigate('/all-class');
    } else {
      toast.error('Please login to enroll in this course', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <div id='courses' className="catalog-container">
      <Container fluid className="px-4">
        {/* Enhanced Header Section */}
        <div className="catalog-header text-center mb-5 py-5">
          <div className="mb-3">
            <Badge bg="primary" className="fs-6 px-3 py-2 rounded-pill">
              <FaGraduationCap className="me-2" />
              Course Catalog
            </Badge>
          </div>
          <h1 className="section-title display-4 fw-bold mb-3">
            Explore Our Premium Courses
          </h1>
          <p className="section-subtitle lead text-muted col-lg-8 col-xl-6 mx-auto">
            Discover world-class programs designed to advance your knowledge, skills, and career prospects
          </p>
        </div>
        
        {/* Enhanced Course Cards */}
        <Row className="course-cards-row g-4 mb-5">
          {courses.map((course, index) => (
            <Col xl={4} lg={6} md={6} sm={12} key={index}>
              <Card className="course-card h-100 shadow-sm border-0 hover-card">
                <div className="position-relative course-image-container">
                  <Card.Img 
                    variant="top" 
                    src={course.image} 
                    alt={course.name} 
                    className="course-image"
                    style={{height: '200px', objectFit: 'cover'}}
                  />
                  <div className="course-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0">
                    <Button variant="light" size="sm" className="rounded-pill">
                      <FaArrowRight className="me-2" />
                      View Details
                    </Button>
                  </div>
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge bg={getCategoryBadgeVariant(course.category)} className="rounded-pill">
                      {course.category}
                    </Badge>
                  </div>
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="course-title h5 mb-0">{course.name}</Card.Title>
                      <div className="text-end">
                        <div className="fw-bold text-primary fs-5">{course.price}</div>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3 text-muted small">
                      <FaStar className="text-warning me-1" />
                      <span className="me-3">{course.rating}</span>
                      <FaClock className="me-1" />
                      <span className="me-3">{course.duration}</span>
                      <FaUsers className="me-1" />
                      <span>{course.students} students</span>
                    </div>
                    
                    <div className="mb-3">
                      <Badge bg={getLevelBadgeVariant(course.level)} className="rounded-pill me-2">
                        {course.level}
                      </Badge>
                    </div>
                    
                    <Card.Text className="course-description text-muted">
                      {course.description}
                    </Card.Text>
                  </div>
                  
                  <div className="topics-container mb-3">
                    <h6 className="topics-title text-dark mb-2">Key Topics:</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {course.topics.slice(0, 4).map((topic, i) => (
                        <Badge key={i} bg="light" text="dark" className="rounded-pill small">
                          {topic}
                        </Badge>
                      ))}
                      {course.topics.length > 4 && (
                        <Badge bg="secondary" className="rounded-pill small">
                          +{course.topics.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-pill fw-semibold"
                        onClick={() => handleEnrollClick('/all-class')}
                      >
                        Enroll Now
                        <FaArrowRight className="ms-2" />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Enhanced Features Section */}
        <div id='features' className="features-section py-5">
          <div className="features-header text-center mb-5">
            <div className="mb-3">
              
            </div>
            <h2 className="section-title display-5 fw-bold mb-3">
              Why Choose PHENIX LMS?
            </h2>
            
          </div>
          
          <Row className="features-row g-4">
            {features.map((feature, index) => (
              <Col xl={4} lg={6} md={6} sm={12} key={index}>
                <Card className="feature-card h-100 border-0 shadow-sm hover-card">
                  <Card.Body className="text-center p-4">
                    <div className={`feature-icon-container mb-3 mx-auto rounded-circle d-flex align-items-center justify-content-center bg-${feature.color} bg-opacity-10`} style={{width: '80px', height: '80px'}}>
                      <div className={`text-${feature.color} fs-2`}>
                        {feature.icon}
                      </div>
                    </div>
                    <Card.Title className="feature-title h5 mb-3">{feature.title}</Card.Title>
                    <Card.Text className="feature-description text-muted">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Call to Action Section */}
        <div className="cta-section text-center py-5 my-5">
          <Card className="border-0 bg-primary text-white rounded-4 shadow-lg">
            <Card.Body className="p-5">
              <h3 className="display-6 fw-bold mb-3">Ready to Start Learning?</h3>
              <p className="lead mb-4 opacity-90">
                Join thousands of students who have transformed their careers with our courses
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Button onClick={() => navigate("/all-class")} variant="light" size="lg" className="rounded-pill px-4 fw-semibold">
                  Browse All Courses
                </Button>
                <Button variant="outline-light" size="lg" className="rounded-pill px-4 fw-semibold">
                  Contact Us
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default CourseCatalog;