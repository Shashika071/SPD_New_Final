import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from 'axios';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const primaryColor = '#667eea';
  const secondaryColor = '#764ba2';

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/enrollments/my-classes', {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        });
        setClasses(response.data.classes);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch your classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter and search functionality
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || cls.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = [...new Set(classes.map(cls => cls.subject))];

  if (loading) {
    return (
      <div  className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border mb-3" role="status" style={{width: '3rem', height: '3rem', color: primaryColor}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="progress mb-3" style={{width: '200px'}}>
                <div className="progress-bar progress-bar-striped progress-bar-animated" 
                     role="progressbar" style={{width: '75%', backgroundColor: primaryColor}}>
                </div>
              </div>
              <h5 className="text-muted">Loading your classes...</h5>
              <p className="text-muted">Please wait while we fetch your enrollment data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div  className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
                <div>
                  <h4 className="alert-heading mb-1">Oops! Something went wrong</h4>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
              <hr />
              <div className="d-flex gap-2">
                <button className="btn btn-outline-danger btn-sm" onClick={() => window.location.reload()}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Try Again
                </button>
                <Link to="/dashboard" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-house me-1"></i>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{marginLeft:'20px'}} className="container-fluid mt-4">
      <style jsx>{`
        .custom-primary {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
        .custom-primary:hover {
          background-color: ${secondaryColor} !important;
          border-color: ${secondaryColor} !important;
        }
        .custom-outline-primary {
          color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
        .custom-outline-primary:hover {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }
        .custom-outline-primary.active {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }
        .custom-badge {
          background-color: ${primaryColor}20 !important;
          color: ${primaryColor} !important;
          border: 1px solid ${primaryColor}40 !important;
        }
        .custom-icon-bg {
          background-color: ${primaryColor}20 !important;
        }
        .custom-icon-color {
          color: ${primaryColor} !important;
        }
        .custom-text-primary {
          color: ${primaryColor} !important;
        }
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.15) !important;
        }
      `}</style>

      {/* Header Section */}
      <div style={{marginTop:'-30px'}} className="row mb-4">
        <div className="col-12">
          <div className="text-white p-4 rounded-3 shadow" style={{background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}}>
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="display-6 fw-bold mb-2">
                  <i className="bi bi-mortarboard-fill me-3"></i>
                  My Learning Journey
                </h1>
                <p className="lead mb-0">Track your enrolled classes and academic progress</p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="text-center">
                  <div className="fs-2 fw-bold">{classes.length}</div>
                  <small>Total Classes</small>
                </div>
                <div className="text-center">
                  <div className="fs-2 fw-bold">{uniqueSubjects.length}</div>
                  <small>Subjects</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-4 mb-3 mb-md-0">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 bg-light"
                      placeholder="Search classes, subjects, or teachers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-3 mb-3 mb-md-0">
                  <select
                    className="form-select border-0 bg-light"
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {uniqueSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3 mb-3 mb-md-0">
                  <div className="btn-group w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${viewMode === 'grid' ? 'custom-primary' : 'custom-outline-primary'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i className="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'custom-primary' : 'custom-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="bi bi-list-ul"></i>
                    </button>
                  </div>
                </div>
                <div className="col-md-2">
                  <Link to="/all-class" className="btn btn-success w-100">
                    <i className="bi bi-plus-circle me-1"></i>
                    Add Class
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="row">
        <div className="col-12">
          {filteredClasses.length === 0 ? (
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-journals display-1 opacity-50 custom-text-primary"></i>
                    </div>
                    <h3 className="card-title text-muted mb-3">
                      {searchTerm || filterSubject !== 'all' ? 'No matching classes found' : 'No classes yet'}
                    </h3>
                    <p className="card-text text-muted mb-4 px-4">
                      {searchTerm || filterSubject !== 'all' 
                        ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                        : 'You haven\'t enrolled in any classes yet. Start your learning journey today and unlock your potential!'
                      }
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      <Link to="/classes" className="btn btn-lg text-white custom-primary">
                        <i className="bi bi-search me-2"></i>
                        Browse Classes
                      </Link>
                      {(searchTerm || filterSubject !== 'all') && (
                        <button 
                          className="btn btn-outline-secondary btn-lg"
                          onClick={() => {
                            setSearchTerm('');
                            setFilterSubject('all');
                          }}
                        >
                          <i className="bi bi-arrow-clockwise me-2"></i>
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'row g-4' : ''}>
              {filteredClasses.map(cls => (
                viewMode === 'grid' ? (
                  <div key={cls.id} className="col-lg-4 col-md-6">
                    <div className="card h-100 shadow-sm border-0 hover-card">
                      <div className="card-header text-white border-0" style={{background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`}}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="card-title mb-0 fw-bold">
                            <i className="bi bi-book-fill me-2"></i>
                            {cls.className}
                          </h5>
                          <div className="dropdown">
                            <button className="btn btn-sm btn-outline-light" type="button" data-bs-toggle="dropdown">
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2"></i>View Details</a></li>
                              <li><a className="dropdown-item" href="#"><i className="bi bi-calendar me-2"></i>Schedule</a></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2"></i>Unenroll</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-6">
                            <small className="text-muted d-block">Subject</small>
                            <span className="badge custom-badge px-2 py-1">
                              {cls.subject}
                            </span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Grade</small>
                            <span className="badge bg-success-subtle text-success-emphasis px-2 py-1">
                              Grade {cls.grade}
                            </span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                          <div className="custom-icon-bg rounded-circle p-2 me-3">
                            <i className="bi bi-person-fill custom-icon-color"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Teacher</small>
                            <span className="fw-semibold">{cls.teacherName}</span>
                          </div>
                        </div>

                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-success-subtle rounded-circle p-2 me-3">
                            <i className="bi bi-calendar-check text-success"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Enrolled</small>
                            <span className="fw-semibold">
                              {new Date(cls.enrollmentDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h6 className="fw-bold custom-text-primary mb-2">
                            <i className="bi bi-clock-fill me-1"></i>
                            Schedule
                          </h6>
                          <div className="accordion accordion-flush" id={`accordion-${cls.id}`}>
                            <div className="accordion-item border-0">
                              <h2 className="accordion-header">
                                <button 
                                  className="accordion-button collapsed p-2 bg-light"
                                  type="button" 
                                  data-bs-toggle="collapse" 
                                  data-bs-target={`#collapse-${cls.id}`}
                                >
                                  <small>{cls.schedules.length} schedule(s)</small>
                                </button>
                              </h2>
                              <div id={`collapse-${cls.id}`} className="accordion-collapse collapse">
                                <div className="accordion-body p-2">
                                  {cls.schedules.map((schedule, idx) => (
                                    <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                      <div>
                                        <small className="fw-semibold d-block">
                                          {new Date(schedule.scheduleDate).toLocaleDateString()}
                                        </small>
                                        <small className="text-muted">
                                          {schedule.startTime} - {schedule.endTime}
                                        </small>
                                      </div>
                                      <span className="badge bg-secondary-subtle text-secondary-emphasis">
                                        {schedule.recurrence}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card-footer bg-transparent border-0">
                        <div className="d-grid gap-2">
                          <Link
                            to={`/classes/${cls.id}/resources`}
                            className="btn text-white custom-primary"
                          >
                            <i className="bi bi-folder-fill me-2"></i>
                            View Resources
                          </Link>
                          <div className="btn-group" role="group">
                            <button type="button" className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-chat-dots"></i>
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-calendar-event"></i>
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-star"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={cls.id} className="card mb-3 shadow-sm border-0 hover-card">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            <div className="custom-icon-bg rounded-circle p-2 me-3">
                              <i className="bi bi-book-fill custom-icon-color"></i>
                            </div>
                            <div>
                              <h5 className="mb-0 fw-bold">{cls.className}</h5>
                              <small className="text-muted">{cls.subject} • Grade {cls.grade}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-4 text-muted">
                            <small>
                              <i className="bi bi-person me-1"></i>
                              {cls.teacherName}
                            </small>
                            <small>
                              <i className="bi bi-calendar-check me-1"></i>
                              Enrolled: {new Date(cls.enrollmentDate).toLocaleDateString()}
                            </small>
                            <small>
                              <i className="bi bi-clock me-1"></i>
                              {cls.schedules.length} schedule(s)
                            </small>
                          </div>
                        </div>
                        <div className="col-md-4 text-md-end">
                          <Link
                            to={`/classes/${cls.id}/resources`}
                            className="btn text-white custom-primary me-2"
                          >
                            <i className="bi bi-folder-fill me-1"></i>
                            Resources
                          </Link>
                          <div className="btn-group" role="group">
                            <button type="button" className="btn btn-outline-secondary btn-sm">
                              <i className="bi bi-three-dots-vertical"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClasses;