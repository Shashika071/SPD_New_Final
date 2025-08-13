import React, { useState } from 'react';

import { api } from '../utils/api';

const GradeAnswer = ({ answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [marks, setMarks] = useState(answer.marks || '');
  const [feedback, setFeedback] = useState(answer.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/answers/${answer.id}`, {
        marks: parseInt(marks),
        feedback
      });
      setIsOpen(false);
      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error updating answer:', error);
      setIsSubmitting(false);
    }
  };

  const getGradeStatus = () => {
    if (answer.marks !== null && answer.marks !== undefined) {
      return {
        text: `${answer.marks} marks`,
        variant: 'success',
        icon: 'check-circle'
      };
    }
    return {
      text: 'Grade Answer',
      variant: 'primary',
      icon: 'edit'
    };
  };

  const gradeStatus = getGradeStatus();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`btn btn-${gradeStatus.variant} btn-sm d-flex align-items-center gap-1`}
      >
        <i className={`fas fa-${gradeStatus.icon}`}></i>
        {gradeStatus.text}
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
  aria-labelledby="gradeAnswerModalLabel"
  aria-hidden="true"
>

            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title" id="gradeAnswerModalLabel">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Grade Answer
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
                    {/* Answer Preview */}
                    {answer.answer_text && (
                      <div className="alert alert-light border-start border-primary border-4 mb-4">
                        <h6 className="alert-heading">
                          <i className="fas fa-quote-left me-2"></i>
                          Student Answer:
                        </h6>
                        <p className="mb-0 text-muted">
                          {answer.answer_text.length > 200 
                            ? `${answer.answer_text.substring(0, 200)}...` 
                            : answer.answer_text
                          }
                        </p>
                      </div>
                    )}

                    {/* Marks Input */}
                    <div className="mb-4">
                      <label htmlFor="marks" className="form-label fw-semibold">
                        <i className="fas fa-star me-2 text-warning"></i>
                        Marks
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="fas fa-hashtag"></i>
                        </span>
                        <input
                          type="number"
                          id="marks"
                          className="form-control"
                          value={marks}
                          onChange={(e) => setMarks(e.target.value)}
                          min="0"
                          placeholder="Enter marks..."
                          required
                        />
                      </div>
                      <div className="form-text">
                        <i className="fas fa-info-circle me-1"></i>
                        Enter the marks earned for this answer
                      </div>
                    </div>

                    {/* Feedback Textarea */}
                    <div className="mb-4">
                      <label htmlFor="feedback" className="form-label fw-semibold">
                        <i className="fas fa-comment-alt me-2 text-info"></i>
                        Feedback
                      </label>
                      <textarea
                        id="feedback"
                        className="form-control"
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Provide constructive feedback for the student..."
                      />
                      <div className="form-text">
                        <i className="fas fa-lightbulb me-1"></i>
                        Optional: Provide feedback to help the student improve
                      </div>
                    </div>

                    {/* Current Grade Display */}
                    {answer.marks !== null && answer.marks !== undefined && (
                      <div className="alert alert-info d-flex align-items-center">
                        <i className="fas fa-info-circle me-2"></i>
                        <div>
                          <strong>Current Grade:</strong> {answer.marks} marks
                          {answer.feedback && (
                            <div className="mt-1">
                              <small className="text-muted">
                                Previous feedback: "{answer.feedback}"
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
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
                      disabled={isSubmitting || !marks}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save me-1"></i>
                          Save Grade
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

export default GradeAnswer;