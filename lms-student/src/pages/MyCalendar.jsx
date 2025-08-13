import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import React, { useEffect, useState } from 'react';

import axios from 'axios';
import enUS from 'date-fns/locale/en-US';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

const MyCalender = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  const getAuthToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/class/resources_all', {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        });

        if (response.data.success) {
          const formattedEvents = formatResourcesAsEvents(response.data.resources);
          setEvents(formattedEvents);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch resources');
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const formatResourcesAsEvents = (resources) => {
    const events = [];

    resources.forEach(classData => {
      // Process questions
      classData.questions.forEach(question => {
        if (question.due_date) {
          const dueDate = new Date(question.due_date);
          events.push({
            id: `question-${question.id}`,
            title: `${question.question_text.substring(0, 30)}${question.question_text.length > 30 ? '...' : ''}`,
            start: dueDate,
            end: new Date(dueDate.getTime() + 30 * 60000),
            resource: question,
            type: 'question',
            classId: classData.class_id,
            className: classData.class_name,
            color: '#dc3545',
            fullText: question.question_text,
            points: question.points,
            questionType: question.question_type,
            originalDueDate: question.due_date
          });
        }
      });

      // Process assignments
      classData.assignments.forEach(assignment => {
        if (assignment.due_date) {
          const dueDate = new Date(assignment.due_date);
          events.push({
            id: `assignment-${assignment.id}`,
            title: `${assignment.title.substring(0, 30)}${assignment.title.length > 30 ? '...' : ''}`,
            start: dueDate,
            end: new Date(dueDate.getTime() + 60 * 60000),
            resource: assignment,
            type: 'assignment',
            classId: classData.class_id,
            className: classData.class_name,
            color: '#0d6efd',
            description: assignment.description,
            totalPoints: assignment.total_points,
            isQuiz: assignment.is_quiz,
            originalDueDate: assignment.due_date
          });
        }
      });
    });

    return events;
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.color,
      borderRadius: '6px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontWeight: '500',
      fontSize: '12px',
      padding: '2px 6px'
    };
    return { style };
  };

  const handleEventMouseEnter = (event, e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      content: renderTooltipContent(event),
      position: { 
        top: rect.top - 10, 
        left: rect.left + rect.width + 10 
      }
    });
  };

  const handleEventMouseLeave = () => {
    setTooltip(null);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const renderTooltipContent = (event) => {
    const dueDate = new Date(event.originalDueDate);
    const formattedDate = dueDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isOverdue = dueDate < new Date();

    return (
      <div className="p-3">
        {event.type === 'question' ? (
          <>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-question-circle-fill text-danger me-2"></i>
              <h6 className="mb-0 fw-bold">Question Details</h6>
            </div>
            <div className="mb-2">
              <small className="text-muted">Class:</small>
              <p className="mb-1 fw-semibold">{event.className}</p>
            </div>
            <div className="mb-2">
              <small className="text-muted">Question:</small>
              <p className="mb-1">{event.fullText}</p>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <small className="text-muted">Type:</small>
                <p className="mb-0 fw-semibold text-capitalize">{event.questionType.replace('_', ' ')}</p>
              </div>
              <div className="col-6">
                <small className="text-muted">Points:</small>
                <p className="mb-0 fw-semibold">{event.points}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-file-text-fill text-primary me-2"></i>
              <h6 className="mb-0 fw-bold">Assignment Details</h6>
            </div>
            <div className="mb-2">
              <small className="text-muted">Class:</small>
              <p className="mb-1 fw-semibold">{event.className}</p>
            </div>
            <div className="mb-2">
              <small className="text-muted">Title:</small>
              <p className="mb-1 fw-semibold">{event.resource.title}</p>
            </div>
            <div className="mb-2">
              <small className="text-muted">Description:</small>
              <p className="mb-1">{event.description}</p>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <small className="text-muted">Points:</small>
                <p className="mb-0 fw-semibold">{event.totalPoints}</p>
              </div>
              {event.isQuiz && (
                <div className="col-6">
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-award me-1"></i>Quiz
                  </span>
                </div>
              )}
            </div>
          </>
        )}
        <div className="border-top pt-2 mt-2">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-muted">Due:</small>
            <span className={`badge ${isOverdue ? 'bg-danger' : 'bg-success'}`}>
              <i className={`bi ${isOverdue ? 'bi-exclamation-triangle' : 'bi-calendar-check'} me-1`}></i>
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getStatsData = () => {
    const today = new Date();
    const upcoming = events.filter(e => new Date(e.originalDueDate) > today).length;
    const overdue = events.filter(e => new Date(e.originalDueDate) < today).length;
    const assignments = events.filter(e => e.type === 'assignment').length;
    const questions = events.filter(e => e.type === 'question').length;
    
    return { upcoming, overdue, assignments, questions };
  };

  const stats = getStatsData();

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5 className="text-muted">Loading your calendar...</h5>
      </div>
    </div>
  );

  if (error) return (
    <div className="container-fluid px-4 py-4">
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
        <div>
          <h4 className="alert-heading mb-1">Failed to Load Calendar</h4>
          <p className="mb-0">{error}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-4 py-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Enhanced Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div 
            className="p-4 rounded-4 shadow-sm position-relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #6f42c1 100%)',
              color: 'white'
            }}
          >
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h1 className="fw-bold mb-2 display-6">
                  <i className="bi bi-calendar-event me-3"></i>
                  Academic Calendar
                </h1>
                <p className="mb-0 opacity-75 fs-5">Keep track of all your assignments and deadlines</p>
              </div>
              <div className="d-none d-md-block">
                <div className="bg-white bg-opacity-20 rounded-3 p-3">
                  <i className="bi bi-calendar3 display-4 opacity-50"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="text-primary me-3">
                  <i className="bi bi-clock-history fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-primary">{stats.upcoming}</h5>
                  <p className="text-muted mb-0 small">Upcoming</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="text-danger me-3">
                  <i className="bi bi-exclamation-triangle fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-danger">{stats.overdue}</h5>
                  <p className="text-muted mb-0 small">Overdue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="text-success me-3">
                  <i className="bi bi-file-text fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-success">{stats.assignments}</h5>
                  <p className="text-muted mb-0 small">Assignments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-3">
              <div className="d-flex align-items-center">
                <div className="text-warning me-3">
                  <i className="bi bi-question-circle fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-warning">{stats.questions}</h5>
                  <p className="text-muted mb-0 small">Questions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-lg">
            
            {/* Calendar Header */}
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <div className="d-flex align-items-center mb-3 mb-md-0">
                  <i className="bi bi-calendar3 text-primary me-2 fs-4"></i>
                  <h4 className="mb-0 fw-bold text-dark">
                    {format(currentDate, 'MMMM yyyy')}
                  </h4>
                </div>
                
                {/* View Buttons */}
                <div className="btn-group" role="group">
                  {['month', 'week', 'day', 'agenda'].map(view => (
                    <button
                      key={view}
                      type="button"
                      className={`btn ${currentView === view ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                      onClick={() => setCurrentView(view)}
                    >
                      <i className={`bi bi-${view === 'month' ? 'calendar3' : view === 'week' ? 'calendar-week' : view === 'day' ? 'calendar-day' : 'list-ul'} me-1`}></i>
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex flex-wrap gap-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-primary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small className="text-muted">Assignments</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="bg-danger rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                    <small className="text-muted">Questions</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-info-circle text-muted me-1"></i>
                    <small className="text-muted">Hover over events for details</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Body */}
            <div className="card-body p-0">
              <div style={{ height: '700px', padding: '20px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day', 'agenda']}
                  view={currentView}
                  onView={handleViewChange}
                  date={currentDate}
                  onNavigate={handleNavigate}
                  onSelectEvent={event => {
                    const eventDetails = `
Title: ${event.resource.title || event.fullText}
Type: ${event.type}
Class: ${event.className}
Due: ${format(new Date(event.originalDueDate), 'PPpp')}
                    `.trim();
                    alert(eventDetails);
                  }}
                  components={{
                    event: ({ event }) => (
                      <div 
                        className="d-flex align-items-center"
                        onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                        onMouseLeave={handleEventMouseLeave}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className={`bi ${event.type === 'assignment' ? 'bi-file-text' : 'bi-question-circle'} me-1`}></i>
                        <span className="text-truncate">{event.title}</span>
                      </div>
                    ),
                    toolbar: ({ label, onNavigate, onView, views, view }) => (
                      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
                        <div className="btn-group">
                          <button className="btn btn-outline-secondary" onClick={() => onNavigate('PREV')}>
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          <button className="btn btn-outline-secondary" onClick={() => onNavigate('TODAY')}>
                            Today
                          </button>
                          <button className="btn btn-outline-secondary" onClick={() => onNavigate('NEXT')}>
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </div>
                        <h5 className="mb-0 fw-bold text-dark">{label}</h5>
                        <div></div>
                      </div>
                    )
                  }}
                  style={{
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Tooltip */}
      {tooltip && (
        <div 
          className="position-fixed bg-white border-0 shadow-lg rounded-3 p-0"
          style={{
            top: `${tooltip.position.top}px`,
            left: `${tooltip.position.left}px`,
            zIndex: 1050,
            maxWidth: '350px',
            minWidth: '280px'
          }}
        >
          <div className="card border-0">
            <div className="card-body p-0">
              {tooltip.content}
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-event {
          border-radius: 6px !important;
          border: none !important;
          font-weight: 500 !important;
        }
        .rbc-today {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
        .rbc-current-time-indicator {
          background-color: #dc3545 !important;
        }
        .rbc-toolbar {
          display: none !important;
        }
        .rbc-month-view {
          border: 1px solid #dee2e6 !important;
          border-radius: 8px !important;
        }
        .rbc-header {
          background-color: #f8f9fa !important;
          border-bottom: 1px solid #dee2e6 !important;
          padding: 12px !important;
          font-weight: 600 !important;
          color: #495057 !important;
        }
        .rbc-date-cell {
          padding: 8px !important;
        }
        .rbc-event:hover {
          opacity: 1 !important;
          transform: scale(1.02) !important;
          transition: all 0.2s ease !important;
        }
        .rbc-slot-selection {
          background-color: rgba(13, 110, 253, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default MyCalender;