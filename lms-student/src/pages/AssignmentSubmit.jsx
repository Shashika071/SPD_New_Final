import { Alert, Badge, Button, Card, Col, Container, Form, ListGroup, Row, Spinner } from 'react-bootstrap';
import { FaCalendarAlt, FaCheck, FaClipboardList, FaClock, FaExclamationTriangle, FaFileUpload, FaPaperPlane, FaQuestionCircle, FaTrophy } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AssignmentSubmit = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // Fetch assignment details
        const [assignmentRes, questionsRes] = await Promise.all([
          axios.get(`http://localhost:4000/api/assignments/${assignmentId}`, {
            headers: {
              'Content-Type': 'application/json',
              'token': getAuthToken()
            }
          }),
          axios.get(`http://localhost:4000/api/assignments/${assignmentId}/questions`, {
            headers: {
              'Content-Type': 'application/json',
              'token': getAuthToken()
            }
          })
        ]);

        setAssignment(assignmentRes.data.assignment);
        setQuestions(questionsRes.data.questions);

        // Initialize answers object
        const initialAnswers = {};
        questionsRes.data.questions.forEach(q => {
          initialAnswers[q.id] = {
            question_id: q.id,
            answer_text: '',
            option_id: null
          };
        });
        setAnswers(initialAnswers);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleAnswerChange = (questionId, value, isOption = false) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [isOption ? 'option_id' : 'answer_text']: value
      }
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    // Validate all required questions are answered
    const unansweredQuestions = questions.filter(q => {
      const answer = answers[q.id];
      return (
        (q.question_type === 'multiple_choice' && !answer.option_id) ||
        ((q.question_type === 'short_answer' || q.question_type === 'essay') && !answer.answer_text.trim())
      );
    });

    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions. ${unansweredQuestions.length} remaining.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get and decode token
      const token = getAuthToken();
      const decoded = jwtDecode(token);
      const studentId = decoded.id; // Assuming your JWT has the user ID in 'id'
      const answersArray = Object.values(answers);
      // Create FormData
      const formData = new FormData();
      formData.append('assignment_id', assignmentId);
      formData.append('answers', JSON.stringify(answersArray));
      formData.append('userId', studentId);

      if (file) {
        formData.append('document', file);
      }

      const response = await axios.post(
        'http://localhost:4000/api/assignments/submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'token': token
          }
        }
      );

      if (response.data.success) {
        setSubmitted(true);
      } else {
        setError(response.data.message || 'Submission failed');
      }
    } catch (err) {
      let errorMessage = 'Failed to submit assignment';
      
      if (err.response) {
        if (err.response.data) {
          errorMessage = err.response.data.message || 
                        err.response.data.error || 
                        errorMessage;
        }
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    const answeredQuestions = questions.filter(q => {
      const answer = answers[q.id];
      return (
        (q.question_type === 'multiple_choice' && answer.option_id) ||
        ((q.question_type === 'short_answer' || q.question_type === 'essay') && answer.answer_text.trim())
      );
    });
    return questions.length > 0 ? (answeredQuestions.length / questions.length) * 100 : 0;
  };


  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center py-5">
                <div className="mb-4">
                  <Spinner animation="border" variant="primary" style={{width: '3rem', height: '3rem'}} />
                </div>
                <h5 className="text-muted">Loading Assignment...</h5>
                <p className="text-muted mb-0">Please wait while we fetch your assignment details.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center py-5">
                <FaExclamationTriangle className="text-danger mb-3" size={50} />
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading>Oops! Something went wrong</Alert.Heading>
                  <p className="mb-0">{error}</p>
                </Alert>
                <Button variant="primary" size="lg" onClick={() => navigate(-1)}>
                  Go Back
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!assignment) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center py-5">
                <FaQuestionCircle className="text-warning mb-3" size={50} />
                <Alert variant="warning" className="mb-0">
                  <Alert.Heading>Assignment Not Found</Alert.Heading>
                  <p className="mb-0">The assignment you're looking for doesn't exist or has been removed.</p>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center py-5">
                <div className="mb-4">
                  <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                    <FaCheck className="text-white" size={40} />
                  </div>
                </div>
                <h2 className="text-success mb-3">Assignment Submitted Successfully!</h2>
                <p className="lead text-muted mb-4">
                  Your work has been submitted for grading. You'll receive notification once it's been reviewed.
                </p>
                <Button variant="success" size="lg" onClick={() => navigate('/dashboard/my-classes')}>
                  Return to My Classes
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  const progress = calculateProgress();

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Header Card */}
          <Card className="shadow-lg border-0 mb-4">
            <Card.Header className="bg-primary text-white py-4">
              <Row className="align-items-center">
                <Col>
                  <h3 className="mb-1">
                    <FaClipboardList className="me-2" />
                    {assignment.title}
                  </h3>
                  <p className="mb-0 opacity-75">{assignment.description}</p>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <FaCalendarAlt className="text-primary me-2" />
                    <div>
                      <small className="text-muted d-block">Due Date</small>
                      <Badge bg={isOverdue(assignment.due_date) ? "danger" : "info"} className="fs-6">
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <FaTrophy className="text-warning me-2" />
                    <div>
                      <small className="text-muted d-block">Total Points</small>
                      <Badge bg="secondary" className="fs-6">{assignment.total_points}</Badge>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="d-flex align-items-center">
                    <FaClock className="text-secondary me-2" />
                    <div>
                      <small className="text-muted d-block">Status</small>
                      <Badge bg={isOverdue(assignment.due_date) ? "danger" : "success"} className="fs-6">
                        {isOverdue(assignment.due_date) ? "Overdue" : "Active"}
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Questions */}
          <Form>
            {questions.map((question, index) => (
              <Card key={question.id} className="shadow-sm border-0 mb-4">
                <Card.Header className="bg-light">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="mb-0">
                        <Badge bg="primary" className="me-2">{index + 1}</Badge>
                        {question.question_text}
                      </h6>
                    </Col>
                    <Col xs="auto">
                      <Badge bg="outline-secondary" className="border">
                        {question.points || question.assignment_points} pts
                      </Badge>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    {question.question_type === 'multiple_choice' ? (
                      question.options ? (
                        <div className="mt-3">
                          {question.options.map((option, optionIndex) => (
                            <Card key={option.id} className="mb-2 border-0 bg-light">
                              <Card.Body className="py-2">
                                <Form.Check
                                  type="radio"
                                  id={`q${question.id}-option${option.id}`}
                                  name={`q${question.id}`}
                                  label={
                                    <span className="ms-2">
                                      <Badge bg="secondary" className="me-2">{String.fromCharCode(65 + optionIndex)}</Badge>
                                      {option.option_text}
                                    </span>
                                  }
                                  checked={answers[question.id]?.option_id === option.id}
                                  onChange={() => handleAnswerChange(question.id, option.id, true)}
                                  className="mb-0"
                                />
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <Alert variant="warning" className="mt-3">
                          <FaExclamationTriangle className="me-2" />
                          No options available for this question
                        </Alert>
                      )
                    ) : (
                      <div className="mt-3">
                        <Form.Control
                          as="textarea"
                          rows={question.question_type === 'essay' ? 8 : 4}
                          value={answers[question.id]?.answer_text || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          placeholder={
                            question.question_type === 'essay' 
                              ? "Write your detailed essay response here..." 
                              : "Type your answer here..."
                          }
                          className="border-0 bg-light"
                          style={{resize: 'vertical'}}
                        />
                        <Form.Text className="text-muted">
                          {question.question_type === 'essay' ? 'Essay response' : 'Short answer'}
                        </Form.Text>
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            ))}

            {/* File Upload Card */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Header className="bg-light">
                <h6 className="mb-0">
                  <FaFileUpload className="me-2 text-primary" />
                  Additional Files (Optional)
                </h6>
              </Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control 
                    type="file" 
                    onChange={handleFileChange}
                    className="border-0 bg-light"
                  />
                  <Form.Text className="text-muted">
                    Upload supporting documents if needed (PDF, DOC, DOCX, etc.)
                  </Form.Text>
                  {file && (
                    <div className="mt-2">
                      <Badge bg="info">
                        <FaFileUpload className="me-1" />
                        {file.name}
                      </Badge>
                    </div>
                  )}
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Error Alert */}
            {error && (
              <Alert variant="danger" className="shadow-sm">
                <FaExclamationTriangle className="me-2" />
                <strong>Error:</strong> {error}
              </Alert>
            )}

            {/* Submit Button */}
            <Card className="shadow-sm border-0">
              <Card.Body>
                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="py-3"
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Submitting Assignment...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default AssignmentSubmit;