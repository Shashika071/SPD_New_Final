import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AvailableClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/classes/available', {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        });
        setClasses(response.data.classes);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleEnroll = async (classId, fees) => {
    try {
      const response = await axios.post(
        'http://localhost:4000/api/enrollments',
        { class_id: classId },
        {
          headers: {
            'Content-Type': 'application/json',
            'token': getAuthToken()
          }
        }
      );

      if (response.data.paymentRequired) {
        navigate(`/payment/${response.data.enrollmentId}`, {
          state: {
            amount: response.data.paymentAmount,
            className: classes.find(c => c.id === classId).className
          }
        });
      } else {
        navigate('/my-classes');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in class');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Something went wrong</h3>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => navigate('/dashboard/my-classes')}
          style={styles.backButton}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
        >
          ← Back to Dashboard
        </button>
        <h1 style={styles.title}>Available Classes</h1>
        <p style={styles.subtitle}>Discover and enroll in courses that match your interests</p>
      </div>

      {classes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📚</div>
          <h3 style={styles.emptyTitle}>No classes available</h3>
          <p style={styles.emptyMessage}>Check back later for new course offerings</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {classes.map(cls => (
            <div key={cls.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{cls.className}</h3>
                <div style={styles.feeContainer}>
                  <span style={cls.fees ? styles.paidBadge : styles.freeBadge}>
                    {cls.fees ? `Rs.${cls.fees}` : 'FREE'}
                  </span>
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Subject</span>
                    <span style={styles.infoValue}>{cls.subject}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>Grade</span>
                    <span style={styles.infoValue}>{cls.grade}</span>
                  </div>
                </div>

                <div style={styles.teacherInfo}>
                  <div style={styles.teacherAvatar}>👨‍🏫</div>
                  <div>
                    <span style={styles.teacherLabel}>Instructor</span>
                    <span style={styles.teacherName}>{cls.teacherName}</span>
                  </div>
                </div>

                <div style={styles.scheduleSection}>
                  <h4 style={styles.scheduleTitle}>Schedule</h4>
                  <div style={styles.scheduleList}>
                    {cls.schedules.map((schedule, idx) => (
                      <div key={idx} style={styles.scheduleItem}>
                        <div style={styles.scheduleDate}>
                          📅 {new Date(schedule.scheduleDate).toLocaleDateString()}
                        </div>
                        <div style={styles.scheduleTime}>
                          🕐 {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div style={styles.scheduleRecurrence}>
                          {schedule.recurrence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button
                  onClick={() => handleEnroll(cls.id, cls.fees)}
                  style={styles.enrollButton}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: '0',
    top: '0',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    color: '#667eea',
    border: '2px solid #667eea',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    margin: '0',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '1.1rem',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  errorTitle: {
    color: '#ef4444',
    marginBottom: '0.5rem',
  },
  errorMessage: {
    color: '#64748b',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  emptyMessage: {
    color: '#64748b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '2rem',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
  },
  cardHeader: {
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: '0',
  },
  feeContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  paidBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  freeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  cardBody: {
    padding: '1.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
  },
  teacherInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  teacherAvatar: {
    fontSize: '1.5rem',
  },
  teacherLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'block',
  },
  teacherName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    display: 'block',
  },
  scheduleSection: {
    marginBottom: '1rem',
  },
  scheduleTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.75rem',
  },
  scheduleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  scheduleItem: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    borderLeft: '4px solid #667eea',
  },
  scheduleDate: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  scheduleTime: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '0.25rem',
  },
  scheduleRecurrence: {
    fontSize: '0.75rem',
    color: '#667eea',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  cardFooter: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },
  enrollButton: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#667eea',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.4)',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default AvailableClasses;