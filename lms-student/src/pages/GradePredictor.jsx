import { AlertCircle, Award, BookOpen, RefreshCw, Target, TrendingUp, Users } from 'lucide-react';
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

  const getGradeConfig = (grade) => {
    const configs = {
      'A': {
        alertClass: 'alert-success',
        textClass: 'text-success',
        borderClass: 'border-success',
        bgClass: 'bg-success',
        interpretation: 'Outstanding performance! Keep up the excellent work!',
        icon: '🏆'
      },
      'B': {
        alertClass: 'alert-primary',
        textClass: 'text-primary',
        borderClass: 'border-primary',
        bgClass: 'bg-primary',
        interpretation: 'Good performance with room for improvement',
        icon: '⭐'
      },
      'C': {
        alertClass: 'alert-warning',
        textClass: 'text-warning',
        borderClass: 'border-warning',
        bgClass: 'bg-warning',
        interpretation: 'Average performance - consider increasing study time',
        icon: '📚'
      },
      'D': {
        alertClass: 'alert-danger',
        textClass: 'text-danger',
        borderClass: 'border-danger',
        bgClass: 'bg-danger',
        interpretation: 'Below average - significant improvement needed',
        icon: '⚠️'
      },
      'F': {
        alertClass: 'alert-danger',
        textClass: 'text-danger',
        borderClass: 'border-danger',
        bgClass: 'bg-danger',
        interpretation: 'Poor performance - please seek academic support',
        icon: '📖'
      }
    };
    return configs[grade] || {
      alertClass: 'alert-secondary',
      textClass: 'text-secondary',
      borderClass: 'border-secondary',
      bgClass: 'bg-secondary',
      interpretation: '',
      icon: '❓'
    };
  };

  const getRecommendations = (hours, attend) => {
    const recommendations = [];
    
    if (hours < 5) {
      recommendations.push({ text: 'Increase study time to at least 5-7 hours per week', icon: '⏰' });
    }
    if (attend < 75) {
      recommendations.push({ text: 'Improve attendance to at least 75%', icon: '👥' });
    }
    if (hours >= 10 && attend >= 85) {
      recommendations.push({ text: 'Excellent study habits! Keep it up!', icon: '🎉' });
    }
    
    return recommendations;
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center py-5"
      style={{ 
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 50%, #f3e5f5 100%)',
        padding: '20px'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            
            {/* Header Section */}
            <div className="text-center mb-5">
              <div 
                className="d-inline-flex align-items-center justify-content-center rounded-4 mb-4 shadow"
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #007bff 0%, #6f42c1 100%)'
                }}
              >
                <TrendingUp size={32} className="text-white" />
              </div>
              <h1 className="display-5 fw-bold text-dark mb-3">Grade Predictor</h1>
              <p className="lead text-muted">Predict student performance based on study habits</p>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: '24px' }}>
              
              {/* Card Header */}
              <div 
                className="card-header border-0 text-white py-4"
                style={{ 
                  background: 'linear-gradient(135deg, #007bff 0%, #6f42c1 100%)',
                  borderRadius: '24px 24px 0 0'
                }}
              >
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <Award size={24} className="me-2" />
                    <h3 className="mb-0 fw-semibold">Performance Prediction</h3>
                  </div>
                  <button
                    onClick={handleRefresh}
                    className="btn btn-light btn-sm bg-white bg-opacity-25 border-0 text-white"
                    style={{ borderRadius: '12px' }}
                    title="Reset Form"
                  >
                    <RefreshCw size={16} className="me-1" />
                    Reset
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body p-5">
                
                {/* Input Fields */}
                <div className="row g-4 mb-4">
                  
                  {/* Study Hours Input */}
                  <div className="col-12">
                    <label className="form-label d-flex align-items-center fw-bold text-dark mb-3">
                      <BookOpen size={20} className="me-2 text-primary" />
                      Weekly Study Hours
                    </label>
                    <div className="position-relative">
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={studyHours}
                        onChange={(e) => setStudyHours(e.target.value)}
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="Enter hours per week (0-20)"
                        style={{ 
                          borderRadius: '12px',
                          paddingRight: '80px',
                          fontSize: '1.1rem'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmit(e);
                          }
                        }}
                      />
                      <span 
                        className="position-absolute text-muted"
                        style={{ 
                          right: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '0.9rem'
                        }}
                      >
                        hrs/week
                      </span>
                    </div>
                  </div>

                  {/* Attendance Input */}
                  <div className="col-12">
                    <label className="form-label d-flex align-items-center fw-bold text-dark mb-3">
                      <Users size={20} className="me-2 text-success" />
                      Attendance Percentage
                    </label>
                    <div className="position-relative">
                      <input
                        type="number"
                        className="form-control form-control-lg border-2"
                        value={attendance}
                        onChange={(e) => setAttendance(e.target.value)}
                        min="0"
                        max="100"
                        placeholder="Enter percentage (0-100)"
                        style={{ 
                          borderRadius: '12px',
                          paddingRight: '50px',
                          fontSize: '1.1rem'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmit(e);
                          }
                        }}
                      />
                      <span 
                        className="position-absolute text-muted"
                        style={{ 
                          right: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '0.9rem'
                        }}
                      >
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="d-grid mb-4">
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`btn btn-lg fw-semibold ${
                      isLoading ? 'btn-secondary' : 'btn-primary'
                    }`}
                    style={{
                      borderRadius: '12px',
                      padding: '15px',
                      fontSize: '1.1rem',
                      background: isLoading ? undefined : 'linear-gradient(135deg, #007bff 0%, #6f42c1 100%)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isLoading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Predicting...
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <Target size={20} className="me-2" />
                        Predict Grade
                      </div>
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center border-0" role="alert" style={{ borderRadius: '12px' }}>
                    <AlertCircle size={20} className="me-2 flex-shrink-0" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Prediction Result */}
                {predictedGrade && (
                  <div className="mt-4">
                    
                    {/* Grade Display */}
                    <div className={`alert ${getGradeConfig(predictedGrade).alertClass} border-3 ${getGradeConfig(predictedGrade).borderClass} text-center`} style={{ borderRadius: '20px' }}>
                      <h4 className="alert-heading fw-bold mb-4 text-dark">Predicted Grade</h4>
                      <div className="d-flex align-items-center justify-content-center mb-4">
                        <span className="fs-1 me-3">{getGradeConfig(predictedGrade).icon}</span>
                        <span className={`display-1 fw-bold ${getGradeConfig(predictedGrade).textClass}`} style={{ fontSize: '5rem' }}>
                          {predictedGrade}
                        </span>
                      </div>
                      <p className={`fs-5 fw-medium fst-italic mb-0 ${getGradeConfig(predictedGrade).textClass}`}>
                        {getGradeConfig(predictedGrade).interpretation}
                      </p>
                    </div>

                    {/* Recommendations */}
                    {studyHours && attendance && (
                      <div className="bg-light p-4 rounded-4 mb-4">
                        <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
                          <Target size={20} className="me-2 text-primary" />
                          Recommendations
                        </h5>
                        {getRecommendations(parseFloat(studyHours), parseFloat(attendance)).length > 0 ? (
                          <div className="row g-3">
                            {getRecommendations(parseFloat(studyHours), parseFloat(attendance)).map((rec, index) => (
                              <div key={index} className="col-12">
                                <div className="bg-white p-3 rounded-3 shadow-sm d-flex align-items-center">
                                  <span className="fs-4 me-3">{rec.icon}</span>
                                  <span className="text-dark">{rec.text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted mb-0">No specific recommendations at this time.</p>
                        )}
                      </div>
                    )}

                    {/* Stats Summary */}
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="bg-primary bg-opacity-10 p-4 rounded-3 border border-primary border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <p className="text-primary fw-semibold mb-1">Study Hours</p>
                              <p className="display-6 fw-bold text-primary mb-0">{studyHours}</p>
                            </div>
                            <BookOpen size={32} className="text-primary opacity-75" />
                          </div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="bg-success bg-opacity-10 p-4 rounded-3 border border-success border-opacity-25">
                          <div className="d-flex align-items-center justify-content-between">
                            <div>
                              <p className="text-success fw-semibold mb-1">Attendance</p>
                              <p className="display-6 fw-bold text-success mb-0">{attendance}%</p>
                            </div>
                            <Users size={32} className="text-success opacity-75" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-muted">
                Enter your study hours and attendance to get an accurate grade prediction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradePredictor;