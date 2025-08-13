import React, { useEffect, useState } from 'react';

import GradeAnswer from './GradeAnswer';
import { api } from '../utils/api';

const QuestionAnswers = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedQuestionData, setSelectedQuestionData] = useState(null);

  // Fetch questions when a class is selected
  useEffect(() => {
    if (selectedClass) {
      const fetchQuestions = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/classes/${selectedClass}/resources`);
          setQuestions(response.data.resources.questions || []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching questions:', error);
          setLoading(false);
        }
      };
      fetchQuestions();
    }
  }, [selectedClass]);

  // Fetch question type and answers when a question is selected
  useEffect(() => {
    if (selectedQuestion) {
      const fetchQuestionAndAnswers = async () => {
        try {
          setLoading(true);

          // Get question metadata
          const questionRes = await api.get(`/questions/${selectedQuestion}`);
          const questionData = questionRes.data.question;
          const type = questionData?.question_type;
          setQuestionType(type);
          setSelectedQuestionData(questionData);

          // If it's multiple choice, don't fetch answers
          if (type === 'multiple_choice') {
            setAnswers([]);
            setLoading(false);
            return;
          }

          // Fetch answers
          const response = await api.get(`/questions/${selectedQuestion}/answers`);
          setAnswers(response.data.answers || []);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching question/answers:', error);
          setLoading(false);
        }
      };
      fetchQuestionAndAnswers();
    } else {
      setAnswers([]);
      setQuestionType('');
      setSelectedQuestionData(null);
    }
  }, [selectedQuestion]);

  // Filter and sort answers
  const getFilteredAnswers = () => {
    let filtered = answers;
    
    if (filterStatus !== 'all') {
      filtered = answers.filter(answer => answer.status === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'name') {
        return a.student_name.localeCompare(b.student_name);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'graded':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'submitted':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'graded':
        return 'fas fa-check-circle';
      case 'pending':
        return 'fas fa-clock';
      case 'submitted':
        return 'fas fa-paper-plane';
      default:
        return 'fas fa-circle';
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'fas fa-list-ul';
      case 'short_answer':
        return 'fas fa-edit';
      case 'essay':
        return 'fas fa-file-alt';
      default:
        return 'fas fa-question-circle';
    }
  };

  const getQuestionTypeBadge = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'bg-primary';
      case 'short_answer':
        return 'bg-info';
      case 'essay':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-primary">Loading question answers...</h5>
          <p className="text-muted">Please wait while we fetch the data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Selection Controls */}
      <div className="row mb-4">
        <div className="col-lg-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <label htmlFor="class-select" className="form-label fw-bold">
                <i className="fas fa-chalkboard-teacher text-primary me-2"></i>
                Select Class
              </label>
              <select
                id="class-select"
                className="form-select form-select-lg"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedQuestion(null);
                }}
              >
                <option value="">Choose a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.class_name} - {cls.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <label htmlFor="question-select" className="form-label fw-bold">
                <i className="fas fa-question-circle text-info me-2"></i>
                Select Question
              </label>
              <select
                id="question-select"
                className="form-select form-select-lg"
                value={selectedQuestion || ''}
                onChange={(e) => setSelectedQuestion(e.target.value)}
                disabled={!selectedClass || questions.length === 0}
              >
                <option value="">Choose a question...</option>
                {questions.map(question => (
                  <option key={question.id} value={question.id}>
                    {question.question_text.substring(0, 60)}
                    {question.question_text.length > 60 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Question Details */}
      {selectedQuestionData && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`${getQuestionTypeIcon(questionType)} text-primary me-2 fs-5`}></i>
                      <h5 className="mb-0 fw-bold">Question Details</h5>
                      <span className={`badge ${getQuestionTypeBadge(questionType)} ms-3`}>
                        {questionType?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="mb-0 text-muted">{selectedQuestionData.question_text}</p>
                  </div>
                </div>
                
                {questionType !== 'multiple_choice' && answers.length > 0 && (
                  <div className="d-flex gap-2 justify-content-end">
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="graded">Graded</option>
                      <option value="submitted">Submitted</option>
                    </select>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="date">Sort by Date</option>
                      <option value="name">Sort by Name</option>
                      <option value="status">Sort by Status</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {selectedQuestion && questionType === 'multiple_choice' ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-list-ul text-primary" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="text-primary">Multiple Choice Question</h4>
          <p className="text-muted">
            This is a multiple choice question. Student answers are automatically evaluated and not displayed here.
          </p>
          <div className="alert alert-info d-inline-block">
            <i className="fas fa-info-circle me-2"></i>
            Check your gradebook for multiple choice results
          </div>
        </div>
      ) : selectedQuestion && getFilteredAnswers().length > 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="row g-4">
              {getFilteredAnswers().map(answer => (
                <div key={answer.id} className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      {/* Student Info Header */}
                      <div className="row align-items-center mb-3">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center">
                            <div className="position-relative me-3">
                              {answer.student_image ? (
                                <img
                                  src={answer.student_image}
                                  alt={answer.student_name}
                                  className="rounded-circle border border-3 border-white shadow"
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold shadow"
                                  style={{ width: '60px', height: '60px', fontSize: '24px' }}
                                >
                                  {answer.student_name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className={`position-absolute bottom-0 end-0 badge rounded-pill ${getStatusBadgeClass(answer.status)}`}>
                                <i className={`${getStatusIcon(answer.status)} small`}></i>
                              </span>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1 fw-bold">{answer.student_name}</h6>
                              <p className="text-muted mb-1 small">
                                <i className="fas fa-calendar-alt me-1"></i>
                                Submitted: {new Date(answer.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-muted mb-0 small">
                                <i className="fas fa-clock me-1"></i>
                                {new Date(answer.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-4 text-end">
                          <div className="mb-2">
                            <span className={`badge ${getStatusBadgeClass(answer.status)} px-3 py-2`}>
                              <i className={`${getStatusIcon(answer.status)} me-1`}></i>
                              {answer.status.charAt(0).toUpperCase() + answer.status.slice(1)}
                            </span>
                          </div>
                          <GradeAnswer answer={answer} />
                        </div>
                      </div>

                      {/* Answer Content */}
                      <div className="border-top pt-3">
                        <div className="row">
                          <div className="col-md-8">
                            <h6 className="fw-bold mb-3">
                              <i className="fas fa-comment-alt text-success me-2"></i>
                              Student Answer:
                            </h6>
                            <div className="bg-light rounded p-4 mb-3">
                              {answer.answer_text ? (
                                <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                                  {answer.answer_text}
                                </p>
                              ) : (
                                <p className="text-muted fst-italic mb-0">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  No text answer provided
                                </p>
                              )}
                            </div>

                            {/* Attached Document */}
                            {answer.document_url && (
                              <div className="mt-3">
                                <a
                                  href={answer.document_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary"
                                >
                                  <i className="fas fa-paperclip me-2"></i>
                                  View Attached Document
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {/* Additional Info Sidebar */}
                          <div className="col-md-4">
                            <div className="bg-light rounded p-3">
                              <h6 className="fw-bold mb-3 text-center">Answer Details</h6>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Word Count:</small>
                                <small className="fw-bold">
                                  {answer.answer_text ? answer.answer_text.split(' ').length : 0}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Characters:</small>
                                <small className="fw-bold">
                                  {answer.answer_text ? answer.answer_text.length : 0}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <small className="text-muted">Attachment:</small>
                                <small className={answer.document_url ? 'text-success' : 'text-muted'}>
                                  <i className={`fas ${answer.document_url ? 'fa-check' : 'fa-times'} me-1`}></i>
                                  {answer.document_url ? 'Yes' : 'No'}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedQuestion ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-comment-slash text-muted" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="text-muted">No answers found</h4>
          <p className="text-muted">
            {filterStatus !== 'all' 
              ? `No ${filterStatus} answers for this question`
              : 'No students have answered this question yet'
            }
          </p>
          {filterStatus !== 'all' && (
            <button 
              className="btn btn-outline-primary"
              onClick={() => setFilterStatus('all')}
            >
              Show All Answers
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-arrow-up text-primary" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="text-primary">Get Started</h4>
          <p className="text-muted">
            {selectedClass 
              ? 'Please select a question to view student answers' 
              : 'Please select a class to begin reviewing question answers'
            }
          </p>
        </div>
      )}

      {/* Summary Statistics */}
      {selectedQuestion && questionType !== 'multiple_choice' && answers.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-chart-bar text-info me-2"></i>
                  Answer Statistics
                </h6>
                <div className="row text-center">
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-success mb-0">
                        {answers.filter(a => a.status === 'graded').length}
                      </h4>
                      <small className="text-muted">Graded</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-warning mb-0">
                        {answers.filter(a => a.status === 'pending').length}
                      </h4>
                      <small className="text-muted">Pending</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-info mb-0">
                        {answers.filter(a => a.status === 'submitted').length}
                      </h4>
                      <small className="text-muted">Submitted</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <h4 className="text-primary mb-0">{answers.length}</h4>
                    <small className="text-muted">Total</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionAnswers;