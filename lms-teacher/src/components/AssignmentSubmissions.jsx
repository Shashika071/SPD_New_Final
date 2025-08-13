import React, { useEffect, useState } from 'react';

import GradeSubmission from './GradeSubmission';
import { api } from '../utils/api';

const AssignmentSubmissions = ({ classes }) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (selectedClass) {
      const fetchAssignments = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/classes/${selectedClass}/resources`);
          setAssignments(response.data.resources.assignments);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching assignments:', error);
          setLoading(false);
        }
      };
      fetchAssignments();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedAssignment) {
      const fetchSubmissions = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/assignments/${selectedAssignment}/submissions`);
          setSubmissions(response.data.submissions);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching submissions:', error);
          setLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [selectedAssignment]);

  // Filter and sort submissions
  const getFilteredSubmissions = () => {
    let filtered = submissions;
    
    if (filterStatus !== 'all') {
      filtered = submissions.filter(sub => sub.status === filterStatus);
    }
    
    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.submission_date) - new Date(a.submission_date);
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
      case 'late':
        return 'bg-danger';
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
      case 'late':
        return 'fas fa-exclamation-triangle';
      default:
        return 'fas fa-circle';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-primary">Loading submissions...</h5>
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
                  setSelectedAssignment(null);
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
              <label htmlFor="assignment-select" className="form-label fw-bold">
                <i className="fas fa-tasks text-success me-2"></i>
                Select Assignment
              </label>
              <select
                id="assignment-select"
                className="form-select form-select-lg"
                value={selectedAssignment || ''}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                disabled={!selectedClass || assignments.length === 0}
              >
                <option value="">Choose an assignment...</option>
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title} (Due: {new Date(assignment.due_date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      {selectedAssignment && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <h5 className="mb-0 fw-bold">
                      <i className="fas fa-file-alt text-info me-2"></i>
                      Submissions Overview
                    </h5>
                    <p className="text-muted mb-0 small">
                      Total: {submissions.length} submissions
                    </p>
                  </div>
                  <div className="col-lg-4">
                    <div className="d-flex gap-2">
                      <select
                        className="form-select form-select-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="graded">Graded</option>
                        <option value="late">Late</option>
                      </select>
                      <select
                        className="form-select form-select-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="status">Sort by Status</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions List */}
      {selectedAssignment && getFilteredSubmissions().length > 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="row g-4">
              {getFilteredSubmissions().map(submission => (
                <div key={submission.id} className="col-lg-6 col-xl-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      {/* Student Info Header */}
                      <div className="d-flex align-items-center mb-3">
                        <div className="position-relative">
                          {submission.student_image ? (
                            <img
                              src={submission.student_image}
                              alt={submission.student_name}
                              className="rounded-circle border border-3 border-white shadow"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold shadow"
                              style={{ width: '60px', height: '60px', fontSize: '24px' }}
                            >
                              {submission.student_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className={`position-absolute bottom-0 end-0 badge rounded-pill ${getStatusBadgeClass(submission.status)}`}>
                            <i className={`${getStatusIcon(submission.status)} small`}></i>
                          </span>
                        </div>
                        <div className="ms-3 flex-grow-1">
                          <h6 className="mb-1 fw-bold">{submission.student_name}</h6>
                          <p className="text-muted mb-0 small">
                            <i className="fas fa-calendar-alt me-1"></i>
                            {new Date(submission.submission_date).toLocaleDateString()}
                          </p>
                          <p className="text-muted mb-0 small">
                            <i className="fas fa-clock me-1"></i>
                            {new Date(submission.submission_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <span className={`badge ${getStatusBadgeClass(submission.status)} px-3 py-2`}>
                          <i className={`${getStatusIcon(submission.status)} me-1`}></i>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </span>
                      </div>

                      {/* Submission Document */}
                      {submission.document_url && (
                        <div className="mb-3">
                          <a
                            href={submission.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            <i className="fas fa-file-download me-2"></i>
                            View Submission Document
                          </a>
                        </div>
                      )}

                      {/* Grade Section */}
                      <div className="border-top pt-3">
                        <GradeSubmission submission={submission} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedAssignment ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-inbox text-muted" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="text-muted">No submissions found</h4>
          <p className="text-muted">
            {filterStatus !== 'all' 
              ? `No ${filterStatus} submissions for this assignment`
              : 'No submissions have been made for this assignment yet'
            }
          </p>
          {filterStatus !== 'all' && (
            <button 
              className="btn btn-outline-primary"
              onClick={() => setFilterStatus('all')}
            >
              Show All Submissions
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
              ? 'Please select an assignment to view submissions' 
              : 'Please select a class to begin reviewing submissions'
            }
          </p>
        </div>
      )}

      {/* Summary Statistics */}
      {selectedAssignment && submissions.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-chart-pie text-info me-2"></i>
                  Submission Statistics
                </h6>
                <div className="row text-center">
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-success mb-0">
                        {submissions.filter(s => s.status === 'graded').length}
                      </h4>
                      <small className="text-muted">Graded</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-warning mb-0">
                        {submissions.filter(s => s.status === 'pending').length}
                      </h4>
                      <small className="text-muted">Pending</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="border-end">
                      <h4 className="text-danger mb-0">
                        {submissions.filter(s => s.status === 'late').length}
                      </h4>
                      <small className="text-muted">Late</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <h4 className="text-primary mb-0">{submissions.length}</h4>
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

export default AssignmentSubmissions;