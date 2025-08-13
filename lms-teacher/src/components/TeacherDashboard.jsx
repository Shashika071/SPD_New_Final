import React, { useEffect, useState } from 'react';

import AssignmentSubmissions from './AssignmentSubmissions';
import QuestionAnswers from './QuestionAnswers';
import TeacherStudents from './TeacherStudents';
import { api } from '../utils/api';

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        const response = await api.get('/classes/teacher');
        setClasses(response.data.classes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };

    fetchTeacherClasses();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="display-6 fw-bold text-primary mb-1">Quiz Management</h1>
              <p className="text-muted mb-0">Manage your classes and track student progress</p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge bg-light text-dark fs-6 px-3 py-2">
                <i className="fas fa-chalkboard-teacher me-2"></i>
                {classes.length} {classes.length === 1 ? 'Class' : 'Classes'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <nav className="nav nav-pills nav-fill">
                <button
                  className={`nav-link ${activeTab === 'students' ? 'active' : ''} border-0 rounded-0 py-3`}
                  onClick={() => setActiveTab('students')}
                >
                  <i className="fas fa-users me-2"></i>
                  My Students
                  {activeTab === 'students' && <span className="badge bg-light text-dark ms-2">Active</span>}
                </button>
                <button
                  className={`nav-link ${activeTab === 'submissions' ? 'active' : ''} border-0 rounded-0 py-3`}
                  onClick={() => setActiveTab('submissions')}
                >
                  <i className="fas fa-file-alt me-2"></i>
                  Assignment Submissions
                  {activeTab === 'submissions' && <span className="badge bg-light text-dark ms-2">Active</span>}
                </button>
                <button
                  className={`nav-link ${activeTab === 'answers' ? 'active' : ''} border-0 rounded-0 py-3`}
                  onClick={() => setActiveTab('answers')}
                >
                  <i className="fas fa-question-circle me-2"></i>
                  Question Answers
                  {activeTab === 'answers' && <span className="badge bg-light text-dark ms-2">Active</span>}
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              {/* Tab Content Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="card-title mb-1">
                    {activeTab === 'students' && (
                      <>
                        <i className="fas fa-users text-primary me-2"></i>
                        Student Management
                      </>
                    )}
                    {activeTab === 'submissions' && (
                      <>
                        <i className="fas fa-file-alt text-success me-2"></i>
                        Assignment Submissions
                      </>
                    )}
                    {activeTab === 'answers' && (
                      <>
                        <i className="fas fa-question-circle text-info me-2"></i>
                        Question & Answers
                      </>
                    )}
                  </h4>
                  <p className="text-muted mb-0 small">
                    {activeTab === 'students' && 'View and manage all your students across different classes'}
                    {activeTab === 'submissions' && 'Review and grade student assignment submissions'}
                    {activeTab === 'answers' && 'Monitor student responses to questions and quizzes'}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="btn-group" role="group">
                  <button type="button" className="btn btn-outline-secondary btn-sm">
                    <i className="fas fa-download me-1"></i>
                    Export
                  </button>
                  <button type="button" className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-filter me-1"></i>
                    Filter
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'students' && (
                  <div className="tab-pane fade show active">
                    <TeacherStudents classes={classes} />
                  </div>
                )}
                {activeTab === 'submissions' && (
                  <div className="tab-pane fade show active">
                    <AssignmentSubmissions classes={classes} />
                  </div>
                )}
                {activeTab === 'answers' && (
                  <div className="tab-pane fade show active">
                    <QuestionAnswers classes={classes} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card bg-light border-0">
            <div className="card-body py-3">
              <div className="row text-center">
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-graduation-cap text-primary fs-4 me-2"></i>
                    <div>
                      <div className="fw-bold">Total Classes</div>
                      <div className="text-muted small">{classes.length}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-clock text-warning fs-4 me-2"></i>
                    <div>
                      <div className="fw-bold">Last Updated</div>
                      <div className="text-muted small">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-chart-line text-success fs-4 me-2"></i>
                    <div>
                      <div className="fw-bold">Active Tab</div>
                      <div className="text-muted small text-capitalize">{activeTab.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;