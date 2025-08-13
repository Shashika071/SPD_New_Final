import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useParams } from 'react-router-dom';

const LearningMaterials = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [writtenQuestions, setWrittenQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { class_id } = useParams();

  const getAuthToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const [assignmentsRes, questionsRes] = await Promise.all([
        axios.get('http://localhost:4000/api/user/assignments', {
          headers: { 'token': getAuthToken() }
        }),
        axios.get('http://localhost:4000/api/user/questions', {
          headers: { 'token': getAuthToken() }
        })
      ]);

      setAssignments(assignmentsRes.data.assignments);
      
      const allQuestions = questionsRes.data.questions;
      setQuizzes(allQuestions.filter(q => 
        ['multiple_choice', 'true_false'].includes(q.question_type)
      ));
      setWrittenQuestions(allQuestions.filter(q => 
        ['short_answer', 'essay'].includes(q.question_type)
      ));
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [class_id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-warning text-dark', icon: 'bi-clock' },
      graded: { class: 'bg-success text-white', icon: 'bi-check-circle' },
      submitted: { class: 'bg-primary text-white', icon: 'bi-upload' }
    };
    const config = statusConfig[status] || { class: 'bg-secondary text-white', icon: 'bi-question' };
    
    return (
      <span className={`badge rounded-pill px-3 py-2 ${config.class}`}>
        <i className={`${config.icon} me-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderScoreDisplay = (score, total, isQuiz = false) => {
    if (score === null || score === undefined) return null;
    
    const percentage = total ? Math.round((score / total) * 100) : 0;
    const getScoreColor = (percent) => {
      if (percent >= 80) return 'text-success';
      if (percent >= 60) return 'text-warning';
      return 'text-danger';
    };
    
    return (
      <div className="d-flex align-items-center">
        <div className="me-3">
          <span className={`fs-4 fw-bold ${getScoreColor(percentage)}`}>{score}</span>
          {isQuiz && <span className="text-muted fs-5">/ {total}</span>}
        </div>
        <div className="text-muted small">
          {percentage}% • {isQuiz ? 'points' : 'marks'}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">Loading your learning materials...</h5>
      </div>
    </div>
  );

  if (error) return (
    <div className="container-fluid px-4 py-4">
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
        <div>
          <h4 className="alert-heading mb-1">Oops! Something went wrong</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    </div>
  );

  const tabConfig = [
    {
      key: 'assignments',
      title: 'Assignments',
      icon: 'bi-journal-text',
      count: assignments.length,
      color: 'primary'
    },
    {
      key: 'quizzes',
      title: 'Quizzes',
      icon: 'bi-question-square-fill',
      count: quizzes.length,
      color: 'success'
    },
    {
      key: 'questions',
      title: 'Written Questions',
      icon: 'bi-pencil-square',
      count: writtenQuestions.length,
      color: 'info'
    }
  ];

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Enhanced Header with gradient background */}
      <div className="row mb-4">
        <div className="col-12">
          <div 
            className="p-4 rounded-4 shadow-sm position-relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
          >
            <div className="position-relative z-index-2">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h1 className="fw-bold mb-2 display-6">
                    <i className="bi bi-journal-bookmark-fill me-3"></i>
                    Learning Materials
                  </h1>
                  <p className="mb-0 opacity-75 fs-5">Track your assignments, quizzes, and written questions</p>
                </div>
                <div className="d-none d-md-block">
                  <div className="bg-white bg-opacity-20 rounded-3 p-3">
                    <i className="bi bi-mortarboard display-4 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="row mb-4">
        {tabConfig.map((tab) => (
          <div key={tab.key} className="col-md-4 mb-3">
            <div 
              className={`card border-0 shadow-sm cursor-pointer transition-all ${activeTab === tab.key ? 'shadow-lg' : ''}`}
              style={{ 
                cursor: 'pointer',
                transform: activeTab === tab.key ? 'translateY(-1px)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="card-body text-center py-3 px-3">
                <div className="d-flex align-items-center justify-content-center">
                  <div className={`text-${tab.color} me-3`}>
                    <i className={`${tab.icon} fs-4`}></i>
                  </div>
                  <div className="text-start">
                    <h5 className="fw-bold mb-0">{tab.count}</h5>
                    <p className="text-muted mb-0 small">{tab.title}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

    

      {/* Content */}
      <div className="row">
        <div className="col-12">
          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="row g-4">
              {assignments.length === 0 ? (
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-journal-text display-1 text-muted opacity-50"></i>
                      </div>
                      <h3 className="fw-bold text-muted mb-3">No Assignments Available</h3>
                      <p className="text-muted mb-4">You don't have any assignments at this time. Check back later!</p>
                      <button className="btn btn-primary" onClick={fetchData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="col-lg-6 col-xl-4">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-header bg-white border-0 pb-0">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h5 className="card-title mb-2 fw-bold text-primary">{assignment.title}</h5>
                            <div className="d-flex flex-wrap gap-2">
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-book me-1"></i>
                                {assignment.class_name}
                              </span>
                              <span className="badge bg-primary bg-opacity-10 text-primary">
                                <i className="bi bi-trophy me-1"></i>
                                {assignment.total_points} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body pt-0">
                        <p className="card-text text-muted mb-4">{assignment.description}</p>
                        
                        <div className="d-flex align-items-center mb-4 p-3 bg-light rounded-3">
                          <i className="bi bi-calendar-event text-primary me-3 fs-5"></i>
                          <div>
                            <small className="text-muted d-block">Due Date</small>
                            <strong>{formatDate(assignment.due_date)}</strong>
                          </div>
                        </div>

                        {assignment.submission ? (
                          <div className="border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold mb-0 text-success">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Submitted
                              </h6>
                              {renderStatusBadge(assignment.submission.status)}
                            </div>
                            
                            <div className="row g-3 mb-3">
                              <div className="col-12">
                                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <h6 className="text-success mb-1">Submitted On</h6>
                                      <p className="mb-0">{formatDate(assignment.submission.submission_date)}</p>
                                    </div>
                                    <i className="bi bi-upload text-success fs-4"></i>
                                  </div>
                                </div>
                              </div>
                              
                              {assignment.submission.grade !== null && (
                                <div className="col-12">
                                  <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25">
                                    <h6 className="text-primary mb-2">
                                      <i className="bi bi-award me-1"></i>
                                      Your Grade
                                    </h6>
                                    {renderScoreDisplay(assignment.submission.grade, assignment.total_points)}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {assignment.submission.feedback && (
                              <div className="p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
                                <h6 className="text-info mb-2">
                                  <i className="bi bi-chat-left-text-fill me-2"></i>
                                  Teacher Feedback
                                </h6>
                                <p className="mb-0 fst-italic">"{assignment.submission.feedback}"</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="alert alert-warning border-0 bg-warning bg-opacity-10">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-exclamation-triangle-fill text-warning me-3 fs-5"></i>
                              <div>
                                <h6 className="alert-heading mb-1">Not Submitted</h6>
                                <p className="mb-0 small">You haven't submitted this assignment yet</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="row g-4">
              {quizzes.length === 0 ? (
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-question-circle display-1 text-muted opacity-50"></i>
                      </div>
                      <h3 className="fw-bold text-muted mb-3">No Quizzes Available</h3>
                      <p className="text-muted mb-4">You don't have any quizzes at this time. Check back later!</p>
                      <button className="btn btn-success" onClick={fetchData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                quizzes.map((quiz) => (
                  <div key={quiz.id} className="col-lg-6">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-header bg-white border-0 pb-0">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h5 className="card-title mb-2 fw-bold text-success">
                              <i className="bi bi-patch-question me-2"></i>
                              Quiz Question
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-book me-1"></i>
                                {quiz.class_name}
                              </span>
                              <span className="badge bg-success bg-opacity-10 text-success">
                                <i className="bi bi-trophy me-1"></i>
                                {quiz.points} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body pt-0">
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 text-dark">Question:</h6>
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-success">
                            <p className="mb-0">{quiz.question_text}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center mb-4 p-3 bg-info bg-opacity-10 rounded-3">
                          <i className="bi bi-stopwatch text-info me-3 fs-5"></i>
                          <div>
                            <small className="text-info d-block">Time Limit</small>
                            <strong>{quiz.time_limit || 'No'} {quiz.time_limit ? 'minutes' : 'time limit'}</strong>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 text-dark">Answer Options:</h6>
                          <div className="list-group">
                            {quiz.options.map((option, index) => (
                              <div 
                                key={option.id} 
                                className={`list-group-item border-0 mb-2 rounded-3 ${
                                  option.is_correct 
                                    ? 'bg-success bg-opacity-10 border-success' 
                                    : 'bg-light'
                                }`}
                              >
                                <div className="d-flex align-items-center">
                                  <span className={`badge rounded-pill me-3 px-3 py-2 ${
                                    option.is_correct 
                                      ? 'bg-success text-white' 
                                      : 'bg-secondary text-white'
                                  }`}>
                                    {option.is_correct ? (
                                      <i className="bi bi-check-lg"></i>
                                    ) : (
                                      String.fromCharCode(65 + index)
                                    )}
                                  </span>
                                  <span className={option.is_correct ? 'fw-bold' : ''}>{option.option_text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {quiz.quizScore !== null && (
                          <div className="p-4 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25 mb-4">
                            <div className="text-center">
                              <h6 className="text-success mb-3">
                                <i className="bi bi-award me-2"></i>
                                Your Score
                              </h6>
                              {renderScoreDisplay(quiz.quizScore, quiz.points, true)}
                            </div>
                          </div>
                        )}

                        {quiz.answer && (
                          <div className="border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold mb-0 text-primary">
                                <i className="bi bi-pencil-fill me-2"></i>
                                Your Answer
                              </h6>
                              {renderStatusBadge(quiz.answer.status)}
                            </div>
                            <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25">
                              <p className="mb-0 fw-bold">{quiz.answer.answer_text}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Written Questions Tab */}
          {activeTab === 'questions' && (
            <div className="row g-4">
              {writtenQuestions.length === 0 ? (
                <div className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-pencil display-1 text-muted opacity-50"></i>
                      </div>
                      <h3 className="fw-bold text-muted mb-3">No Written Questions Available</h3>
                      <p className="text-muted mb-4">You don't have any written questions at this time. Check back later!</p>
                      <button className="btn btn-info" onClick={fetchData}>
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                writtenQuestions.map((question) => (
                  <div key={question.id} className="col-lg-6">
                    <div className="card h-100 border-0 shadow-sm hover-shadow">
                      <div className="card-header bg-white border-0 pb-0">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h5 className="card-title mb-2 fw-bold text-info">
                              <i className={`${question.question_type === 'essay' ? 'bi-journal-text' : 'bi-pencil-square'} me-2`}></i>
                              {question.question_type === 'essay' ? 'Essay Question' : 'Short Answer Question'}
                            </h5>
                            <div className="d-flex flex-wrap gap-2">
                              <span className="badge bg-light text-dark">
                                <i className="bi bi-book me-1"></i>
                                {question.class_name}
                              </span>
                              <span className="badge bg-info bg-opacity-10 text-info">
                                <i className="bi bi-trophy me-1"></i>
                                {question.points} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body pt-0">
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3 text-dark">Question:</h6>
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-info">
                            <p className="mb-0">{question.question_text}</p>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center mb-4 p-3 bg-warning bg-opacity-10 rounded-3">
                          <i className="bi bi-calendar-event text-warning me-3 fs-5"></i>
                          <div>
                            <small className="text-warning d-block">Due Date</small>
                            <strong>{formatDate(question.due_date)}</strong>
                          </div>
                        </div>

                        {question.answer ? (
                          <div className="border-top pt-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="fw-bold mb-0 text-success">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Answered
                              </h6>
                              {renderStatusBadge(question.answer.status)}
                            </div>
                            
                            <div className="mb-3">
                              <h6 className="fw-bold mb-2 text-dark">Your Answer:</h6>
                              <div className="p-3 bg-light rounded-3 border">
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{question.answer.answer_text}</p>
                              </div>
                            </div>
                            
                            {question.answer.document_url && (
                              <div className="mb-3">
                                <a 
                                  href={question.answer.document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary"
                                >
                                  <i className="bi bi-paperclip me-2"></i>
                                  View Attached Document
                                </a>
                              </div>
                            )}
                            
                            {question.answer.marks !== null && (
  <div className="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25 mb-3">
    <h6 className="text-primary mb-2">
      <i className="bi bi-award me-1"></i>
      Marks Awarded
    </h6>
    {renderScoreDisplay(
      question.answer.marks,
      question.question_type === 'short_answer' ? question.points * 100 : question.points * 10
    )}
  </div>
)}

                            
                            {question.answer.feedback && (
                              <div className="p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
                                <h6 className="text-info mb-2">
                                  <i className="bi bi-chat-left-text-fill me-2"></i>
                                  Teacher Feedback
                                </h6>
                                <p className="mb-0 fst-italic">"{question.answer.feedback}"</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="alert alert-warning border-0 bg-warning bg-opacity-10">
                            <div className="d-flex align-items-center">
                              <i className="bi bi-exclamation-triangle-fill text-warning me-3 fs-5"></i>
                              <div>
                                <h6 className="alert-heading mb-1">Not Answered</h6>
                                <p className="mb-0 small">You haven't answered this question yet</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningMaterials;