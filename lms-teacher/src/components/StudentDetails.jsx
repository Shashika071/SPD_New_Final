import React, { useEffect, useState } from 'react';

import { api } from '../utils/api';

const StudentDetails = ({ student }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState(student);

  // Function to properly encode image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as-is
    if (imagePath.startsWith('http')) return imagePath;
    
    // Encode each part of the path separately
    const baseUrl = 'http://localhost:4000';
    const encodedPath = imagePath.split('/')
      .map(part => encodeURIComponent(part))
      .join('/');
    
    return `${baseUrl}/images/${encodedPath}`;
  };

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/students/${student.student_id}/enrollments`);
        
        const formattedEnrollments = response.data.enrollments.map(enrollment => ({
          ...enrollment,
          payment_amount: enrollment.payment_amount ? parseFloat(enrollment.payment_amount) : null
        }));

        setEnrollments(formattedEnrollments || []);
        if (response.data.student) {
          setStudentDetails(prev => ({
            ...prev,
            ...response.data.student,
            profile_image: getImageUrl(response.data.student.profile_image)
          }));
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load enrollment data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [student.student_id]);

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: { class: 'success', icon: 'check-circle' },
      pending: { class: 'warning', icon: 'clock' },
      failed: { class: 'danger', icon: 'times-circle' },
      cancelled: { class: 'secondary', icon: 'ban' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', icon: 'question-circle' };
    
    return (
      <span className={`badge bg-${config.class} d-flex align-items-center gap-1`}>
        <i className={`fas fa-${config.icon}`}></i>
        {status}
      </span>
    );
  };

  return (
    <div className="container-fluid p-0">
      {/* Student Profile Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto">
              {studentDetails.profile_image ? (
                <img
                  src={getImageUrl(studentDetails.profile_image)}
                  alt={studentDetails.student_name}
                  className="rounded-circle border"
                  style={{width: '80px', height: '80px', objectFit: 'cover'}}
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                  }}
                />
              ) : (
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border"
                     style={{width: '80px', height: '80px'}}>
                  <span className="fs-3 fw-bold">
                    {studentDetails.student_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="col">
              <h3 className="mb-2 text-primary">
                <i className="fas fa-user-graduate me-2"></i>
                {studentDetails.student_name}
              </h3>
              
              <div className="row g-2">
                <div className="col-md-6">
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-envelope me-2"></i>
                    <span className="small">
                      {studentDetails.email || 'No email provided'}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-phone me-2"></i>
                    <span className="small">
                      {studentDetails.phone || 'No phone provided'}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-user-friends me-2"></i>
                    <span className="small">
                      Parent: {studentDetails.parent_phone || 'No parent phone'}
                    </span>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="d-flex align-items-center text-muted">
                    <i className="fas fa-calendar me-2"></i>
                    <span className="small">
                      ID: {studentDetails.student_id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="fas fa-graduation-cap me-2"></i>
            Class Enrollments
          </h5>
          <span className="badge bg-info">
            {enrollments.length} {enrollments.length === 1 ? 'enrollment' : 'enrollments'}
          </span>
        </div>

        <div className="card-body p-0">
          {error ? (
            <div className="alert alert-danger m-3" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted">Loading enrollment data...</p>
            </div>
          ) : enrollments.length > 0 ? (
            <div className="list-group list-group-flush">
              {enrollments.map((enrollment, index) => (
                <div key={enrollment.id} className="list-group-item">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <div className="d-flex align-items-start">
                        <div className="me-3">
                          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                               style={{width: '40px', height: '40px'}}>
                            <i className="fas fa-book text-primary"></i>
                          </div>
                        </div>
                        
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold">
                            {enrollment.class_name}
                          </h6>
                          
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-light text-dark">
                              <i className="fas fa-book-open me-1"></i>
                              {enrollment.subject}
                            </span>
                            <span className="badge bg-light text-dark">
                              <i className="fas fa-layer-group me-1"></i>
                              Grade {enrollment.grade}
                            </span>
                          </div>
                          
                          <small className="text-muted">
                            <i className="fas fa-calendar-plus me-1"></i>
                            Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </small>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-4 text-md-end mt-3 mt-md-0">
                      <div className="d-flex flex-column align-items-md-end gap-2">
                        {getPaymentStatusBadge(enrollment.payment_status)}
                        
                        {enrollment.payment_amount && (
                          <div className="fw-bold text-success">
                            <i className="fas fa-dollar-sign me-1"></i>
                            Rs.{parseFloat(enrollment.payment_amount).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {enrollment.teacher_name && (
                    <div className="mt-2 pt-2 border-top">
                      <small className="text-muted">
                        <i className="fas fa-chalkboard-teacher me-1"></i>
                        Teacher: {enrollment.teacher_name}
                      </small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-graduation-cap text-muted" style={{fontSize: '3rem'}}></i>
              <h5 className="text-muted mt-3">No Enrollments Found</h5>
              <p className="text-muted mb-0">
                This student is not currently enrolled in any classes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;