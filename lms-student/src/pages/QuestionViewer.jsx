import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  ProgressBar,
  Row,
  Spinner
} from 'react-bootstrap';
import {
  FaArrowLeft,
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaComments,
  FaEdit,
  FaExclamationTriangle,
  FaEye,
  FaFileAlt,
  FaHourglassHalf,
  FaTrophy
} from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';

const QuestionViewer = () => {
  const { questionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const questionType = location.state?.questionType || 'short_answer';
  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/questions/${questionId}/view?questionType=${questionType}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'token': getAuthToken()
            }
          }
        );
        
        setQuestion(response.data.question);
        if (response.data.question.answer) {
          setAnswer(response.data.question.answer.text || '');
          if (questionType === 'essay') {
            setWordCount(response.data.question.answer.text?.trim().split(/\s+/).length || 0);
          }
          if (response.data.question.answer.status === 'graded' || 
              response.data.question.answer.status === 'pending') {
            setIsSubmitted(true);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId, questionType]);

  const handleAnswerChange = (e) => {
    const text = e.target.value;
    setAnswer(text);
    if (questionType === 'essay') {
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError('Please provide an answer');
      return;
    }

    if (questionType === 'essay' && wordCount < 100) {
      setError('Essay must be at least 100 words');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(
        `http://localhost:4000/api/questions/${questionId}/answer`,
        {
          answer_text: answer
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        }
      );

      if (response.data.success) {
        setShowSuccessModal(true);
        setIsSubmitted(true);
        // Refresh the question data
        const updatedResponse = await axios.get(
          `http://localhost:4000/api/questions/${questionId}/view?questionType=${questionType}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'token': getAuthToken()
            }
          }
        );
        setQuestion(updatedResponse.data.question);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate word count progress for essays
  const getWordCountProgress = () => {
    if (questionType !== 'essay') return 0;
    return Math.min((wordCount / 100) * 100, 100);
  };

  const getWordCountVariant = () => {
    if (wordCount >= 100) return 'success';
    if (wordCount >= 75) return 'warning';
    return 'danger';
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
                <h5 className="text-muted">Loading Question...</h5>
                <p className="text-muted mb-0">Please wait while we fetch the question details.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

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
                  <FaArrowLeft className="me-2" /> Go Back
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!question) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="text-center py-5">
                <FaFileAlt className="text-warning mb-3" size={50} />
                <Alert variant="warning" className="mb-0">
                  <Alert.Heading>Question Not Found</Alert.Heading>
                  <p className="mb-0">The question you're looking for doesn't exist or has been removed.</p>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-success">
            <FaCheckCircle className="me-2" />
            Success!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-3">
            <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
              <FaCheck className="text-white" size={24} />
            </div>
          </div>
          <h6 className="mb-2">Answer Submitted Successfully!</h6>
          <p className="text-muted mb-0">Your answer has been saved and submitted for evaluation.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="success" onClick={() => setShowSuccessModal(false)} className="mx-auto">
            Continue
          </Button>
        </Modal.Footer>
      </Modal>

      <Row>
        <Col lg={8} className="mx-auto">
          {/* Header Navigation */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button variant="outline-primary" onClick={() => navigate(-1)}>
              <FaArrowLeft className="me-2" /> Back to Questions
            </Button>
            <Badge bg={questionType === 'short_answer' ? 'success' : 'info'} className="fs-6 px-3 py-2">
              {questionType === 'short_answer' ? (
                <>
                  <FaEdit className="me-2" />
                  Short Answer
                </>
              ) : (
                <>
                  <FaFileAlt className="me-2" />
                  Essay Question
                </>
              )}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="shadow-lg border-0 mb-4">
            <Card.Header className="bg-primary text-white py-4">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-1">{question.question_text}</h4>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <FaTrophy className="text-warning me-2" />
                    <div>
                      <small className="text-muted d-block">Total Points</small>
                      <Badge bg="secondary" className="fs-6">{question.points}</Badge>
                    </div>
                  </div>
                </Col>
                {question.answer?.marks !== null && question.answer?.marks !== undefined && (
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <FaCheckCircle className="text-success me-2" />
                      <div>
                        <small className="text-muted d-block">Your Score</small>
                        <Badge bg="success" className="fs-6">
                          {question.answer.marks}/{question.points}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>

              {/* Status Alerts */}
              {question.answer?.status === 'graded' && question.answer?.feedback && (
                <Alert variant="info" className="shadow-sm">
                  <div className="d-flex align-items-start">
                    <FaComments className="text-info me-2 mt-1" />
                    <div>
                      <Alert.Heading className="h6 mb-2">Teacher Feedback</Alert.Heading>
                      <p className="mb-0">{question.answer.feedback}</p>
                    </div>
                  </div>
                </Alert>
              )}

              {isSubmitted && question.answer?.status === 'pending' && (
                <Alert variant="warning" className="shadow-sm">
                  <div className="d-flex align-items-center">
                    <FaHourglassHalf className="text-warning me-2" />
                    <div>
                      <Alert.Heading className="h6 mb-1">Pending Evaluation</Alert.Heading>
                      <p className="mb-0">Your answer has been submitted and is waiting for teacher evaluation.</p>
                    </div>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* Answer Input Card */}
          <Card className="shadow-lg border-0 mb-4">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  {questionType === 'short_answer' ? (
                    <>
                      <FaEdit className="me-2 text-primary" />
                      Your Answer
                    </>
                  ) : (
                    <>
                      <FaFileAlt className="me-2 text-primary" />
                      Your Essay
                    </>
                  )}
                </h6>
                {questionType === 'essay' && (
                  <Badge bg={getWordCountVariant()} className="fs-6">
                    {wordCount} words
                  </Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {questionType === 'essay' && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-muted">Word Count Progress</small>
                    <small className="text-muted">
                      {wordCount >= 100 ? 'Requirement met' : `${100 - wordCount} words needed`}
                    </small>
                  </div>
                  <ProgressBar 
                    now={getWordCountProgress()} 
                    variant={getWordCountVariant()}
                    style={{height: '6px'}}
                  />
                </div>
              )}

              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={questionType === 'short_answer' ? 6 : 12}
                  value={answer}
                  onChange={handleAnswerChange}
                  placeholder={
                    questionType === 'short_answer' ? 
                    'Type your answer here...' : 
                    'Write your essay here...'
                  }
                  readOnly={isSubmitted}
                  className="border-0 bg-light"
                  style={{resize: 'vertical'}}
                />
                <Form.Text className="text-muted">
                  {questionType === 'short_answer' ? 
                   'Be concise but thorough in your response' : 
                   'Minimum 100 words required for essay questions'}
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="shadow-sm mb-4">
              <div className="d-flex align-items-center">
                <FaExclamationTriangle className="text-danger me-2" />
                <div>
                  <Alert.Heading className="h6 mb-1">Error</Alert.Heading>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
            </Alert>
          )}

          {/* Submit/Status Card */}
          <Card className="shadow-lg border-0">
            <Card.Body>
              {!isSubmitted ? (
                <div className="d-grid">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      !answer.trim() ||
                      (questionType === 'essay' && wordCount < 100)
                    }
                    className="py-3"
                  >
                    {submitting ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" className="me-2" />
                        Submitting Answer...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Submit Answer
                      </>
                    )}
                  </Button>
                  {(questionType === 'essay' && wordCount < 100) && (
                    <Form.Text className="text-muted text-center mt-2">
                      Please write at least 100 words before submitting
                    </Form.Text>
                  )}
                </div>
              ) : question.answer?.status === 'graded' ? (
                <Alert variant="success" className="text-center mb-0">
                  <div className="d-flex align-items-center justify-content-center">
                    <FaCheckCircle className="text-success me-2" size={20} />
                    <div>
                      <Alert.Heading className="h6 mb-1">Answer Graded</Alert.Heading>
                      <p className="mb-0">Your answer has been graded and cannot be modified.</p>
                    </div>
                  </div>
                </Alert>
              ) : (
                <Alert variant="warning" className="text-center mb-0">
                  <div className="d-flex align-items-center justify-content-center">
                    <FaClock className="text-warning me-2" size={20} />
                    <div>
                      <Alert.Heading className="h6 mb-1">Submission Pending</Alert.Heading>
                      <p className="mb-0">Your answer has been submitted and is pending evaluation.</p>
                    </div>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionViewer;