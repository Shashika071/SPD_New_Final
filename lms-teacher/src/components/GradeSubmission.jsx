import React, { useState } from 'react';

import { api } from '../utils/api';

const GradeSubmission = ({ submission }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [status, setStatus] = useState(submission.status || 'pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/submissions/${submission.id}`, {
        grade: parseFloat(grade),
        feedback,
        status
      });
      setIsOpen(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating submission:', error);
      setIsSubmitting(false);
    }
  };

  const getGradeButtonInfo = () => {
    if (submission.grade !== null && submission.grade !== undefined) {
      const gradeValue = parseFloat(submission.grade);
      let variant = 'success';
      let icon = 'check-circle';
      
      if (gradeValue < 50) {
        variant = 'danger';
        icon = 'times-circle';
      } else if (gradeValue < 75) {
        variant = 'warning';
        icon = 'exclamation-circle';
      }

      return {
        text: `Grade: ${gradeValue}%`,
        variant,
        icon
      };
    }
    return {
      text: 'Grade Submission',
      variant: 'primary',
      icon: 'edit'
    };
  };

  const getStatusBadge = (currentStatus) => {
    const statusConfig = {
      pending: { class: 'warning', icon: 'clock', text: 'Pending' },
      graded: { class: 'success', icon: 'check-circle', text: 'Graded' },
      reviewed: { class: 'info', icon: 'eye', text: 'Reviewed' },
      returned: { class: 'secondary', icon: 'undo', text: 'Returned' }
    };
    
    const config = statusConfig[currentStatus] || statusConfig.pending;
    return (
      <span className={`badge bg-${config.class} d-flex align-items-center gap-1`}>
        <i className={`fas fa-${config.icon}`}></i>
        {config.text}
      </span>
    );
  };

  const buttonInfo = getGradeButtonInfo();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`btn btn-${buttonInfo.variant} btn-sm d-flex align-items-center gap-1`}
      >
        <i className={`fas fa-${buttonInfo.icon}`}></i>
        {buttonInfo.text}
      </button>

      {isOpen && (
        <>
          {/* Bootstrap Modal Backdrop */}
          <div
  className="modal-backdrop fade show"
  style={{ zIndex: 9998 }}
  onClick={() => setIsOpen(false)}
></div>

          
          {/* Bootstrap Modal */}
          <div
  className="modal fade show d-block"
  tabIndex="-1"
  style={{
    zIndex: 9999,
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'auto'
  }}
  aria-labelledby="gradeSubmissionModalLabel"
  aria-hidden="true"
>

            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title" id="gradeSubmissionModalLabel">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Grade Submission
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white" 
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                  ></button>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* Submission Info */}
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="card bg-light">
                          <div className="card-body">
                            <h6 className="card-title">
                              <i className="fas fa-file-alt me-2"></i>
                              Submission Details
                            </h6>
                            <div className="row g-2">
                              <div className="col-6">
                                <small className="text-muted">Student:</small>
                                <div className="fw-semibold">
                                  {submission.student_name || 'Unknown Student'}
                                </div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted">Submitted:</small>
                                <div className="fw-semibold">
                                  {submission.submitted_at 
                                    ? new Date(submission.submitted_at).toLocaleDateString()
                                    : 'N/A'
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-center justify-content-end">
                        <div className="text-end">
                          <small className="text-muted d-block">Current Status:</small>
                          {getStatusBadge(submission.status)}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-4">
                        {/* Grade Input */}
                        <div className="mb-3">
                          <label htmlFor="grade" className="form-label fw-semibold">
                            <i className="fas fa-percentage me-2 text-success"></i>
                            Grade (%)
                          </label>
                          <div className="input-group">
                            <input
                              type="number"
                              id="grade"
                              className="form-control"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value)}
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="0.00"
                              required
                            />
                            <span className="input-group-text">%</span>
                          </div>
                          <div className="form-text">
                            <i className="fas fa-info-circle me-1"></i>
                            Enter a grade between 0 and 100
                          </div>
                        </div>

                        {/* Status Select */}
                        <div className="mb-3">
                          <label htmlFor="status" className="form-label fw-semibold">
                            <i className="fas fa-flag me-2 text-info"></i>
                            Status
                          </label>
                          <select
                            id="status"
                            className="form-select"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="pending">
                              🕐 Pending Review
                            </option>
                            <option value="graded">
                              ✅ Graded
                            </option>
                            <option value="reviewed">
                              👁️ Reviewed
                            </option>
                            <option value="returned">
                              ↩️ Returned for Revision
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="col-md-8">
                        {/* Feedback Textarea */}
                        <div className="mb-3">
                          <label htmlFor="feedback" className="form-label fw-semibold">
                            <i className="fas fa-comments me-2 text-warning"></i>
                            Feedback & Comments
                          </label>
                          <textarea
                            id="feedback"
                            className="form-control"
                            rows="6"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Provide detailed feedback to help the student understand their performance and areas for improvement..."
                          />
                          <div className="form-text">
                            <i className="fas fa-lightbulb me-1"></i>
                            Provide constructive feedback to help student growth
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grade Preview */}
                    {grade && (
                      <div className="mt-4">
                        <div className="alert alert-info d-flex align-items-center">
                          <i className="fas fa-preview me-2"></i>
                          <div className="flex-grow-1">
                            <strong>Grade Preview:</strong>
                            <div className="mt-1">
                              <span className={`badge ${
                                parseFloat(grade) >= 85 ? 'bg-success' :
                                parseFloat(grade) >= 75 ? 'bg-primary' :
                                parseFloat(grade) >= 65 ? 'bg-warning' :
                                parseFloat(grade) >= 50 ? 'bg-orange' : 'bg-danger'
                              } me-2`}>
                                {parseFloat(grade)}%
                              </span>
                              {parseFloat(grade) >= 90 && '🌟 Excellent!'}
                              {parseFloat(grade) >= 80 && parseFloat(grade) < 90 && '👍 Great work!'}
                              {parseFloat(grade) >= 70 && parseFloat(grade) < 80 && '✅ Good job!'}
                              {parseFloat(grade) >= 60 && parseFloat(grade) < 70 && '⚠️ Needs improvement'}
                              {parseFloat(grade) < 60 && '❌ Requires attention'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Grade Display */}
                    {submission.grade !== null && submission.grade !== undefined && (
                      <div className="alert alert-secondary">
                        <h6 className="alert-heading">
                          <i className="fas fa-history me-2"></i>
                          Current Grade Information
                        </h6>
                        <div className="row">
                          <div className="col-md-4">
                            <strong>Grade:</strong> {submission.grade}%
                          </div>
                          <div className="col-md-4">
                            <strong>Status:</strong> {getStatusBadge(submission.status)}
                          </div>
                          <div className="col-md-4">
                            <strong>Last Updated:</strong> 
                            <small className="d-block">
                              {submission.updated_at 
                                ? new Date(submission.updated_at).toLocaleString()
                                : 'N/A'
                              }
                            </small>
                          </div>
                        </div>
                        {submission.feedback && (
                          <div className="mt-2 pt-2 border-top">
                            <strong>Previous Feedback:</strong>
                            <div className="mt-1 p-2 bg-light rounded">
                              <small>"{submission.feedback}"</small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsOpen(false)}
                      disabled={isSubmitting}
                    >
                      <i className="fas fa-times me-1"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || !grade}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Saving Grade...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Grade & Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GradeSubmission;