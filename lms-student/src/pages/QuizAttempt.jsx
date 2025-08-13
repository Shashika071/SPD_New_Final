import { Alert, Button, Card, Container, Form, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/questions/${quizId}`, {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        });
        setQuiz(response.data.question);
        // Convert minutes to seconds for the timer
        setTimeLeft(response.data.question.time_limit * 60);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOptionChange = (optionId) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = async () => {
    if (timeLeft !== null && timeLeft <= 0) {
      setError('Time has run out!');
      return;
    }

    if (!selectedOption) {
      setError('Please select an answer before submitting');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:4000/api/quizzes/attempt', {
        quiz_id: quizId,
        answers: [{ option_id: selectedOption }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'token': getAuthToken()
        }
      });

      setResult(response.data.attempt);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading quiz...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Quiz not found
        </Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container className="my-5">
        <Card className="text-center">
          <Card.Body>
            {result.is_correct ? (
              <>
                <FaCheckCircle className="text-success mb-3" size={50} />
                <Card.Title>Correct Answer!</Card.Title>
                <Card.Text>
                  You scored {result.score} points.
                </Card.Text>
              </>
            ) : (
              <>
                <FaTimesCircle className="text-danger mb-3" size={50} />
                <Card.Title>Incorrect Answer</Card.Title>
                <Card.Text>
                  You scored {result.score} points.
                </Card.Text>
              </>
            )}
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Quiz</h4>
          <div className="text-danger">
            <FaClock /> Time Remaining: {formatTime(timeLeft)}
          </div>
        </Card.Header>
        <Card.Body>
          <Card.Title>{quiz.question_text}</Card.Title>
          <Card.Text className="text-muted mb-4">
            Points: {quiz.points} | Time Limit: {quiz.time_limit} minute(s)
          </Card.Text>

          <Form>
            {quiz.options.map(option => (
              <Form.Check
                key={option.id}
                type="radio"
                id={`option-${option.id}`}
                name="quizOption"
                label={option.option_text}
                checked={selectedOption === option.id}
                onChange={() => handleOptionChange(option.id)}
                className="mb-3 p-3 border rounded"
              />
            ))}
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || !selectedOption || (timeLeft !== null && timeLeft <= 0)}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Submitting...
                </>
              ) : (
                'Submit Answer'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default QuizAttempt;