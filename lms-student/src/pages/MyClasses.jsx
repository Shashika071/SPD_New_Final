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

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Initialize Bootstrap
  useEffect(() => {
    const initBootstrap = () => {
      if (typeof window !== 'undefined' && window.bootstrap) {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new window.bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Initialize collapses
        const collapses = [].slice.call(document.querySelectorAll('.collapse'));
        collapses.map(function (collapseEl) {
          return new window.bootstrap.Collapse(collapseEl, {
            toggle: false
          });
        });
      }
    };

    if (typeof window !== 'undefined' && !window.bootstrap) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
      script.onload = initBootstrap;
      document.body.appendChild(script);
    } else {
      initBootstrap();
    }
  }, []);

  // Fetch classes
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

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || cls.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = [...new Set(classes.map(cls => cls.subject))];

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Render schedule accordion
  const renderScheduleAccordion = (cls) => {
    return (
      <div className="mb-3">
        <h6 className="fw-bold custom-text-primary mb-2">
          <i className="bi bi-clock-fill me-1"></i>
          Schedule
        </h6>
        {cls.schedules?.length > 0 ? (
          <div className="accordion" id={`scheduleAccordion-${cls.id}`}>
            {cls.schedules.map((schedule, idx) => {
              const scheduleDate = new Date(schedule.scheduleDate);
              const formattedDate = scheduleDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div key={idx} className="accordion-item border-0">
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button collapsed bg-light"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#scheduleCollapse-${cls.id}-${idx}`}
                      aria-expanded="false"
                    >
                      <div>
                        <small className="fw-semibold">{formattedDate}</small>
                        <small className="d-block text-muted">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </small>
                      </div>
                    </button>
                  </h2>
                  <div
                    id={`scheduleCollapse-${cls.id}-${idx}`}
                    className="accordion-collapse collapse"
                    data-bs-parent={`#scheduleAccordion-${cls.id}`}
                  >
                    <div className="accordion-body p-2">
                      <div className="d-flex justify-content-between">
                        <div>
                          <small className="text-muted d-block">Location</small>
                          <span>{schedule.location}</span>
                        </div>
                        <div>
                          <small className="text-muted d-block">Recurrence</small>
                          <span className="badge bg-secondary-subtle text-secondary-emphasis">
                            {schedule.recurrence}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="alert alert-light border" role="alert">
            <small className="text-muted">No schedule available</small>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border mb-3" role="status" style={{width: '3rem', height: '3rem', color: primaryColor}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="text-muted">Loading your classes...</h5>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="alert alert-danger border-0 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
                <div>
                  <h4 className="alert-heading mb-1">Error loading classes</h4>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
              <hr />
              <button className="btn btn-outline-danger btn-sm" onClick={() => window.location.reload()}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4" style={{ marginLeft: '20px' }}>
      <style jsx>{`
        .custom-primary {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
        .custom-primary:hover {
          background-color: ${secondaryColor} !important;
          border-color: ${secondaryColor} !important;
        }
        .custom-text-primary {
          color: ${primaryColor} !important;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(102, 126, 234, 0.15) !important;
        }
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
        }
        .accordion-button:focus {
          box-shadow: none;
        }
      `}</style>

      {/* Header Section */}
      <div style={{ marginTop: '-30px' }} className="row mb-4">
        <div className="col-12">
          <div className="text-white p-4 rounded-3 shadow" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1 className="display-6 fw-bold mb-2">
                  <i className="bi bi-mortarboard-fill me-3"></i>
                  My Classes
                </h1>
                <p className="lead mb-0">View your enrolled classes and schedules</p>
              </div>
              <div className="mt-2 mt-md-0">
               
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
                      placeholder="Search classes..."
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
                      className={`btn ${viewMode === 'grid' ? 'custom-primary text-white' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i className="bi bi-grid-3x3-gap"></i> Grid
                    </button>
                    <button
                      type="button"
                      className={`btn ${viewMode === 'list' ? 'custom-primary text-white' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="bi bi-list-ul"></i> List
                    </button>
                  </div>
                </div>
                <div className="col-md-2">
                  <Link to="/all-class" className="btn btn-success w-100">
                    <i className="bi bi-eye me-1"></i>
                    Browse Classes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="row">
        <div className="col-12">
          {filteredClasses.length === 0 ? (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="bi bi-journals display-1 text-muted mb-4"></i>
                <h3 className="text-muted mb-3">
                  {searchTerm || filterSubject !== 'all' ? 'No matching classes found' : 'No classes enrolled'}
                </h3>
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSubject('all');
                    }}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset Filters
                  </button>
                  <Link to="/classes/enroll" className="btn btn-success">
                    <i className="bi bi-plus-circle me-2"></i>
                    Enroll in a Class
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="row g-4">
                {filteredClasses.map(cls => (
                  <div key={cls.id} className="col-lg-4 col-md-6">
                    <div className="card h-100 shadow-sm border-0 hover-card" style={{ transition: 'all 0.3s ease' }}>
                      <div className="card-header text-white border-0" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                        <h5 className="card-title mb-0 fw-bold">
                          <i className="bi bi-book-fill me-2"></i>
                          {cls.className}
                        </h5>
                      </div>
                      
                      <div className="card-body">
                        <div className="row mb-3">
                          <div className="col-6">
                            <small className="text-muted d-block">Subject</small>
                            <span className="badge bg-primary-subtle text-primary-emphasis px-2 py-1">
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
                          <div className="bg-primary-subtle rounded-circle p-2 me-3">
                            <i className="bi bi-person-fill text-primary"></i>
                          </div>
                          <div>
                            <small className="text-muted d-block">Teacher</small>
                            <span className="fw-semibold">{cls.teacherName}</span>
                          </div>
                        </div>

                        {renderScheduleAccordion(cls)}
                      </div>

                      <div className="card-footer bg-transparent border-0">
                        <Link
                          to={`/classes/${cls.id}/resources`}
                          className="btn btn-primary w-100"
                        >
                          <i className="bi bi-folder-fill me-2"></i>
                          View Resources
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  {filteredClasses.map(cls => (
                    <div key={cls.id} className="p-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-1 fw-bold">{cls.className}</h5>
                          <small className="text-muted">{cls.subject} • Grade {cls.grade}</small>
                        </div>
                        <Link
                          to={`/classes/${cls.id}/resources`}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="bi bi-folder-fill me-1"></i>
                          Resources
                        </Link>
                      </div>
                      <div className="mt-2">
                        {renderScheduleAccordion(cls)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MyClasses;