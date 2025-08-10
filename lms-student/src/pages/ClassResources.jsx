import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import axios from 'axios';

const ClassResources = () => {
    const { class_id } = useParams();
    const navigate = useNavigate();
    const [resources, setResources] = useState({
      assignments: [],
      quizzes: [],
      short_answer_questions: [],
      essay_questions: [],
      past_papers: [],
      videos: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('quizzes');

    const getAuthToken = () => {
      return localStorage.getItem('token');
    };

    useEffect(() => {
      const fetchResources = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4000/api/class/${class_id}/resources`,
            {
              headers: {
                'Content-Type': 'application/json',
                'token': getAuthToken()
              }
            }
          );
          setResources({
          
            quizzes: response.data.resources.quizzes || [],
            assignments: response.data.resources.assignments || [],
            short_answer_questions: response.data.resources.short_answer_questions || [],
            essay_questions: response.data.resources.essay_questions || [],
            past_papers: response.data.resources.past_papers || [],
            videos: response.data.resources.videos || []
          });
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch resources');
        } finally {
          setLoading(false);
        }
      };

      fetchResources();
    }, [class_id]);

    const handleAssignmentSubmit = (assignmentId) => {
      navigate(`/assignments/${assignmentId}/submit`);
    };

    const handleQuizAttempt = (quizId) => {
      navigate(`/quizzes/${quizId}/attempt`);
    };

    const handleQuestionView = (questionId, type) => {
      navigate(`/questions/${questionId}/view`, { state: { questionType: type } });
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'No due date';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const tabs = [
      { id: 'quizzes', label: 'Quizzes', icon: '❓', count: resources.quizzes.length },
      { id: 'assignments', label: 'Assignments', icon: '📝', count: resources.assignments.length },
      { id: 'short_answer', label: 'Short Answer', icon: '📋', count: resources.short_answer_questions.length },
      { id: 'essay', label: 'Essay Questions', icon: '📄', count: resources.essay_questions.length },
      { id: 'videos', label: 'Videos', icon: '🎥', count: resources.videos.length },
      { id: 'past_papers', label: 'Past Papers', icon: '📚', count: resources.past_papers.length }
    ];

    if (loading) {
      return (
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Loading resources...</p>
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
            <button
              onClick={() => window.location.reload()}
              style={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    const renderContent = () => {
      switch (activeTab) {
        case 'assignments':
          return renderAssignments();
        case 'quizzes':
          return renderQuizzes();
        case 'short_answer':
          return renderShortAnswer();
        case 'essay':
          return renderEssayQuestions();
        case 'videos':
          return renderVideos();
        case 'past_papers':
          return renderPastPapers();
        default:
          return null;
      }
    };

    const renderAssignments = () => (
      <div>
        <h3 style={styles.sectionTitle}>📝 Assignments</h3>
        {resources.assignments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📝</div>
            <p style={styles.emptyText}>No assignments available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.assignments.map(assignment => (
              <div key={assignment.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{assignment.title}</h4>
                  <div style={styles.badgeContainer}>
                    <span style={assignment.submitted ? styles.successBadge : styles.warningBadge}>
                      {assignment.submitted ? '✅ Submitted' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {assignment.description || 'No description provided'}
                  </p>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>📅</span>
                      <span style={styles.infoText}>Due: {formatDate(assignment.due_date)}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>⭐</span>
                      <span style={styles.infoText}>Points: {assignment.total_points}</span>
                    </div>
                  </div>
                </div>
                {!assignment.submitted && (
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => handleAssignmentSubmit(assignment.id)}
                      style={styles.primaryButton}
                    >
                      Submit Assignment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderQuizzes = () => (
      <div>
        <h3 style={styles.sectionTitle}>❓ Quizzes</h3>
        {resources.quizzes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>❓</div>
            <p style={styles.emptyText}>No quizzes available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.quizzes.map(quiz => (
              <div key={quiz.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Quiz #{quiz.id}</h4>
                  <div style={styles.badgeContainer}>
                    <span style={quiz.attempted ? styles.successBadge : styles.warningBadge}>
                      {quiz.attempted ? '✅ Attempted' : '⏳ Not Attempted'}
                    </span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {quiz.question_text || 'No description provided'}
                  </p>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>⭐</span>
                      <span style={styles.infoText}>Points: {quiz.points}</span>
                    </div>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>📊</span>
                      <span style={styles.infoText}>Options: {quiz.options?.length || 0}</span>
                    </div>
                  </div>
                </div>
                {!quiz.attempted && (
                  <div style={styles.cardFooter}>
                    <button
                      onClick={() => handleQuizAttempt(quiz.id)}
                      style={styles.primaryButton}
                    >
                      Attempt Quiz
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderShortAnswer = () => (
      <div>
        <h3 style={styles.sectionTitle}>📋 Short Answer Questions</h3>
        {resources.short_answer_questions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p style={styles.emptyText}>No short answer questions available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.short_answer_questions.map(question => (
              <div key={question.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Question #{question.id}</h4>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {question.question_text || 'No question text'}
                  </p>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>⭐</span>
                      <span style={styles.infoText}>Points: {question.points}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleQuestionView(question.id, 'short_answer')}
                    style={styles.primaryButton}
                  >
                    View Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderEssayQuestions = () => (
      <div>
        <h3 style={styles.sectionTitle}>📄 Essay Questions</h3>
        {resources.essay_questions.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <p style={styles.emptyText}>No essay questions available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.essay_questions.map(question => (
              <div key={question.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>Question #{question.id}</h4>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {question.question_text || 'No question text'}
                  </p>
                  <div style={styles.cardInfo}>
                    <div style={styles.infoItem}>
                      <span style={styles.infoIcon}>⭐</span>
                      <span style={styles.infoText}>Points: {question.points}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => handleQuestionView(question.id, 'essay')}
                    style={styles.primaryButton}
                  >
                    View Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderVideos = () => (
      <div>
        <h3 style={styles.sectionTitle}>🎥 Video Lectures</h3>
        {resources.videos.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎥</div>
            <p style={styles.emptyText}>No videos available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.videos.map(video => (
              <div key={video.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{video.title}</h4>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {video.description || 'No description provided'}
                  </p>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => window.open(video.video_url, '_blank')}
                    style={styles.primaryButton}
                  >
                    Watch Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const renderPastPapers = () => (
      <div>
        <h3 style={styles.sectionTitle}>📚 Past Papers</h3>
        {resources.past_papers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <p style={styles.emptyText}>No past papers available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {resources.past_papers.map(paper => (
              <div key={paper.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h4 style={styles.cardTitle}>{paper.title}</h4>
                  <div style={styles.badgeContainer}>
                    <span style={styles.infoBadge}>{paper.year}</span>
                  </div>
                </div>
                <div style={styles.cardBody}>
                  <p style={styles.cardDescription}>
                    {paper.description || 'No description provided'}
                  </p>
                </div>
                <div style={styles.cardFooter}>
                  <button
                    onClick={() => window.open(paper.paper_url, '_blank')}
                    style={styles.primaryButton}
                  >
                    Download Paper
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
          >
            ← Back
          </button>
          <h1 style={styles.title}>Class Resources</h1>
          <p style={styles.subtitle}>Access all your learning materials in one place</p>
        </div>

        <div style={styles.tabContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? styles.activeTab : styles.tab}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span style={styles.tabLabel}>{tab.label}</span>
              {tab.count > 0 && <span style={styles.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {renderContent()}
        </div>
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
      marginBottom: '2rem',
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
      marginBottom: '1.5rem',
    },
    retryButton: {
      padding: '0.75rem 2rem',
      backgroundColor: '#667eea',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    tabContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      marginBottom: '2rem',
      backgroundColor: '#fff',
      padding: '1rem',
      borderRadius: '16px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: 'transparent',
      color: '#64748b',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    activeTab: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      backgroundColor: '#667eea',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
    },
    tabIcon: {
      fontSize: '1.1rem',
    },
    tabLabel: {
      whiteSpace: 'nowrap',
    },
    tabCount: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      color: '#fff',
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    content: {
      minHeight: '400px',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem',
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
      fontSize: '1.1rem',
      fontWeight: '600',
      margin: '0',
    },
    badgeContainer: {
      display: 'flex',
      gap: '0.5rem',
    },
    successBadge: {
      backgroundColor: 'rgba(34, 197, 94, 0.9)',
      color: '#fff',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    warningBadge: {
      backgroundColor: 'rgba(251, 191, 36, 0.9)',
      color: '#fff',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    infoBadge: {
      backgroundColor: 'rgba(59, 130, 246, 0.9)',
      color: '#fff',
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    cardBody: {
      padding: '1.5rem',
    },
    cardDescription: {
      color: '#64748b',
      fontSize: '0.95rem',
      marginBottom: '1rem',
      lineHeight: '1.5',
    },
    cardInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    infoIcon: {
      fontSize: '1rem',
    },
    infoText: {
      fontSize: '0.9rem',
      color: '#64748b',
    },
    cardFooter: {
      padding: '1.5rem',
      backgroundColor: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
    },
    primaryButton: {
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
      boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
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
    emptyText: {
      color: '#64748b',
      fontSize: '1.1rem',
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

  export default ClassResources;