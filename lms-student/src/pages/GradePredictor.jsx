import { AlertCircle, BookOpen, TrendingUp, Users } from 'lucide-react';
import React, { useState } from 'react';

const GradePredictor = () => {
  const [studyHours, setStudyHours] = useState('');
  const [attendance, setAttendance] = useState('');
  const [predictedGrade, setPredictedGrade] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRefresh = () => {
    setStudyHours('');
    setAttendance('');
    setPredictedGrade('');
    setError('');
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPredictedGrade('');
    
    if (!studyHours || !attendance) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(studyHours) < 0 || parseFloat(studyHours) > 20) {
      setError('Study hours must be between 0 and 20');
      return;
    }

    if (parseFloat(attendance) < 0 || parseFloat(attendance) > 100) {
      setError('Attendance must be between 0 and 100%');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call your backend API which loads the model
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          study_hours: parseFloat(studyHours),
          attendance: parseFloat(attendance)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get prediction from server');
      }
      
      const data = await response.json();
      setPredictedGrade(data.grade);
    } catch (err) {
      setError('Failed to make prediction. Please ensure the server is running.');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColorClass = (grade) => {
    switch (grade) {
      case 'A': return 'text-success';
      case 'B': return 'text-primary';
      case 'C': return 'text-warning';
      case 'D': return 'text-danger';
      case 'F': return 'text-danger';
      default: return 'text-dark';
    }
  };

  const getGradeBackgroundClass = (grade) => {
    switch (grade) {
      case 'A': return 'alert-success border-success';
      case 'B': return 'alert-primary border-primary';
      case 'C': return 'alert-warning border-warning';
      case 'D': return 'alert-danger border-danger';
      case 'F': return 'alert-danger border-danger';
      default: return 'alert-light border-secondary';
    }
  };

  const getInterpretation = (grade) => {
    switch (grade) {
      case 'A': return 'Outstanding performance! Keep up the excellent work!';
      case 'B': return 'Good performance with room for improvement';
      case 'C': return 'Average performance - consider increasing study time';
      case 'D': return 'Below average - significant improvement needed';
      case 'F': return 'Poor performance - please seek academic support';
      default: return '';
    }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      {/* Font Awesome for icons */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        rel="stylesheet" 
      />
      
      <div 
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ 
          backgroundColor: '#f8f9fa',
          padding: '20px'
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              
              {/* Header */}
              <div className="text-center mb-4">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                  style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#007bff'
                  }}
                >
                  <TrendingUp size={32} color="white" />
                </div>
                <h1 className="display-5 fw-bold text-dark mb-2">Grade Predictor</h1>
                <p className="text-muted mb-0">Predict student performance based on study habits</p>
              </div>

              {/* Main Card */}
              <div className="card shadow-lg border-0" style={{ borderRadius: '15px' }}>
                <div className="card-body p-4">
                  
                  {/* Refresh Button */}
                  <div className="d-flex justify-content-end mb-3">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={handleRefresh}
                      title="Reset Form"
                    >
                      <i className="fas fa-refresh me-1"></i>
                      Refresh
                    </button>
                  </div>
                  
                  {/* Study Hours Input */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold d-flex align-items-center text-dark">
                      <BookOpen size={18} className="me-2 text-primary" />
                      Weekly Study Hours
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      min="0"
                      max="20"
                      step="0.5"
                      placeholder="Enter hours per week (0-20)"
                      style={{ borderRadius: '10px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                    />
                  </div>

                  {/* Attendance Input */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold d-flex align-items-center text-dark">
                      <Users size={18} className="me-2 text-success" />
                      Attendance Percentage
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-lg border-2"
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      min="0"
                      max="100"
                      placeholder="Enter percentage (0-100)"
                      style={{ borderRadius: '10px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e);
                        }
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid mb-3">
                    <button
                      className={`btn btn-lg ${isLoading ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={handleSubmit}
                      disabled={isLoading}
                      style={{
                        backgroundColor: isLoading ? undefined : '#007bff',
                        border: 'none',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isLoading ? (
                        <div className="d-flex align-items-center justify-content-center">
                          <div 
                            className="spinner-border spinner-border-sm me-2" 
                            role="status"
                            aria-hidden="true"
                          ></div>
                          Predicting...
                        </div>
                      ) : (
                        'Predict Grade'
                      )}
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <AlertCircle size={20} className="me-2" />
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Prediction Result */}
                  {predictedGrade && (
                    <div className={`alert ${getGradeBackgroundClass(predictedGrade)} text-center border-3`} style={{ borderRadius: '15px' }}>
                      <h4 className="alert-heading mb-3 text-dark">Predicted Grade</h4>
                      <div 
                        className={`display-1 fw-bold ${getGradeColorClass(predictedGrade)} mb-3`}
                        style={{ fontSize: '4rem' }}
                      >
                        {predictedGrade}
                      </div>
                      <p className="mb-0 fst-italic text-dark">
                        {getInterpretation(predictedGrade)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-4">
                <p className="text-muted small mb-0">
                  Enter your study hours and attendance to get a grade prediction
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    </>
  );
};

export default GradePredictor;