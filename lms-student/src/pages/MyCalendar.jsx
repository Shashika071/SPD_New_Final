import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarStyles.css';

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
            title: `❓ ${question.question_text.substring(0, 20)}${question.question_text.length > 20 ? '...' : ''}`,
            start: dueDate,
            end: new Date(dueDate.getTime() + 30 * 60000), // 30 minutes duration
            resource: question,
            type: 'question',
            classId: classData.class_id,
            className: classData.class_name,
            color: '#FF6B6B',
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
            title: `📝 ${assignment.title.substring(0, 20)}${assignment.title.length > 20 ? '...' : ''}`,
            start: dueDate,
            end: new Date(dueDate.getTime() + 60 * 60000), // 60 minutes duration
            resource: assignment,
            type: 'assignment',
            classId: classData.class_id,
            className: classData.class_name,
            color: '#4ECDC4',
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
    const backgroundColor = event.color;
    const style = {
      backgroundColor,
      borderRadius: '8px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
      fontWeight: 'bold'
    };
    return { style };
  };

  const handleEventMouseEnter = (event, e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      content: renderTooltipContent(event),
      position: { top: rect.top - 10, left: rect.left + rect.width + 10 }
    });
  };

  const handleEventMouseLeave = () => {
    setTooltip(null);
  };

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
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

    switch (event.type) {
      case 'question':
        return (
          <div>
            <h4>Question Details</h4>
            <p><strong>Class:</strong> {event.className}</p>
            <p><strong>Full Text:</strong> {event.fullText}</p>
            <p><strong>Type:</strong> {event.questionType}</p>
            <p><strong>Points:</strong> {event.points}</p>
            <p><strong>Due:</strong> {formattedDate}</p>
          </div>
        );
      case 'assignment':
        return (
          <div>
            <h4>Assignment Details</h4>
            <p><strong>Class:</strong> {event.className}</p>
            <p><strong>Title:</strong> {event.resource.title}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Total Points:</strong> {event.totalPoints}</p>
            <p><strong>Due:</strong> {formattedDate}</p>
            {event.isQuiz && <p>📊 This is a quiz</p>}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div className="calendar-loading">Loading resources...</div>;
  if (error) return <div className="calendar-error">Error: {error}</div>;

  return (
    <div className="calendar-container">
      <h2 className="calendar-header">Class Resources Calendar</h2>
      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={event => {
            alert(`Selected: ${event.resource.title || event.fullText}\nType: ${event.type}\nClass: ${event.className}`);
          }}
          components={{
            event: ({ event }) => (
              <div 
                className="custom-event"
                onMouseEnter={(e) => handleEventMouseEnter(event, e)}
                onMouseLeave={handleEventMouseLeave}
              >
                <strong>{event.title}</strong>
              </div>
            )
          }}
        />
      </div>
      
      {tooltip && (
        <div 
          className="event-tooltip"
          style={{
            position: 'fixed',
            top: `${tooltip.position.top}px`,
            left: `${tooltip.position.left}px`,
            zIndex: 100
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default MyCalender;