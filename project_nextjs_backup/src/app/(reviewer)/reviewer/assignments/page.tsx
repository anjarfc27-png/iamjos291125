'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import type { ReviewerAssignment } from '@/features/reviewer/data';
import { withAuth } from '@/lib/auth-client';

type FilterType = 'all' | 'pending' | 'active' | 'completed';

function ReviewerAssignments() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<ReviewerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    async function loadAssignments() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/reviewer/assignments?filter=${filter}`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load assignments');
        }
        setAssignments(data.assignments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load assignments');
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [filter]);

  const calculateDaysRemaining = (dueDate: string | null): number | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: ReviewerAssignment['status']) => {
    switch (status) {
      case 'pending': return { bg: '#fff3cd', color: '#856404' };
      case 'accepted': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'completed': return { bg: '#d4edda', color: '#155724' };
      case 'declined': return { bg: '#e2e3e5', color: '#383d41' };
      case 'cancelled': return { bg: '#e2e3e5', color: '#383d41' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const getStatusLabel = (status: ReviewerAssignment['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'In Progress';
      case 'completed': return 'Completed';
      case 'declined': return 'Declined';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getDaysColor = (days: number | null) => {
    if (days === null) return { color: '#666' };
    if (days < 0) return { color: '#dc3545' };
    if (days <= 7) return { color: '#ff9800' };
    return { color: '#00B24E' };
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingCount = assignments.filter(a => a.status === 'pending').length;
  const activeCount = assignments.filter(a => a.status === 'accepted' && !a.submittedAt).length;
  const completedCount = assignments.filter(a => a.status === 'completed' || a.submittedAt !== null).length;
  const overdueCount = assignments.filter(a => {
    const days = calculateDaysRemaining(a.dueDate);
    return days !== null && days < 0 && (a.status === 'pending' || a.status === 'accepted');
  }).length;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            Review Assignments
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage your review assignments
          </p>
        </div>
      </div>

      {/* Filter Tabs - OJS PKP 3.3 Style */}
      <div style={{
        borderBottom: '2px solid #e5e5e5',
        backgroundColor: '#fff',
        padding: '0 0',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: filter === 'all' ? 600 : 400,
            color: filter === 'all' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: filter === 'all' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: filter === 'all' ? '-2px' : '0'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.color = '#002C40';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.color = '#006798';
            }
          }}
        >
          All ({assignments.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: filter === 'pending' ? 600 : 400,
            color: filter === 'pending' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: filter === 'pending' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: filter === 'pending' ? '-2px' : '0'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'pending') {
              e.currentTarget.style.color = '#002C40';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'pending') {
              e.currentTarget.style.color = '#006798';
            }
          }}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('active')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: filter === 'active' ? 600 : 400,
            color: filter === 'active' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: filter === 'active' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: filter === 'active' ? '-2px' : '0'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'active') {
              e.currentTarget.style.color = '#002C40';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'active') {
              e.currentTarget.style.color = '#006798';
            }
          }}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: filter === 'completed' ? 600 : 400,
            color: filter === 'completed' ? '#002C40' : '#006798',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: filter === 'completed' ? '2px solid #006798' : '2px solid transparent',
            cursor: 'pointer',
            marginBottom: filter === 'completed' ? '-2px' : '0'
          }}
          onMouseEnter={(e) => {
            if (filter !== 'completed') {
              e.currentTarget.style.color = '#002C40';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'completed') {
              e.currentTarget.style.color = '#006798';
            }
          }}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Summary Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Total Assignments
            </h3>
            <FileText style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {assignments.length}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Pending
            </h3>
            <Clock style={{ width: '1rem', height: '1rem', color: '#ff9800' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#ff9800',
            marginBottom: '0.25rem'
          }}>
            {pendingCount}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Active
            </h3>
            <CheckCircle style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {activeCount}
          </div>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Overdue
            </h3>
            <XCircle style={{ width: '1rem', height: '1rem', color: '#dc3545' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#dc3545',
            marginBottom: '0.25rem'
          }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dc3545',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc3545' }} />
          <p style={{ margin: 0, color: '#dc3545', fontSize: '0.875rem' }}>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '2rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.875rem'
        }}>
          Loading assignments...
        </div>
      )}

      {/* Assignments List - OJS PKP 3.3 Style */}
      {!loading && !error && (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e5e5e5',
            backgroundColor: '#f8f9fa'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#002C40',
              margin: 0
            }}>
              Review Assignments
            </h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {assignments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                fontSize: '0.875rem',
                color: '#666',
                fontStyle: 'italic'
              }}>
                No review assignments found.
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {assignments.map((assignment) => {
                  const daysRemaining = calculateDaysRemaining(assignment.dueDate);
                  const isOverdue = daysRemaining !== null && daysRemaining < 0 && (assignment.status === 'pending' || assignment.status === 'accepted');
                  const statusColors = getStatusColor(assignment.status);
                  const daysColors = getDaysColor(daysRemaining);
                  
                  return (
                    <div 
                      key={assignment.id} 
                      style={{
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        padding: '1.25rem',
                        backgroundColor: '#fff',
                        transition: 'box-shadow 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontWeight: 600,
                            fontSize: '1.125rem',
                            color: '#002C40',
                            margin: 0,
                            marginBottom: '0.5rem'
                          }}>
                            {assignment.submissionTitle}
                          </h3>
                          {assignment.authorNames && (
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#666',
                              margin: 0,
                              marginBottom: '0.25rem'
                            }}>
                              Authors: {assignment.authorNames}
                            </p>
                          )}
                          {assignment.journalTitle && (
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#666',
                              margin: 0
                            }}>
                              Journal: {assignment.journalTitle}
                            </p>
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '0.5rem'
                        }}>
                          <span style={{
                            backgroundColor: statusColors.bg,
                            color: statusColors.color,
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            {getStatusLabel(assignment.status)}
                          </span>
                          {isOverdue && (
                            <span style={{
                              backgroundColor: '#f8d7da',
                              color: '#721c24',
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                              display: 'inline-block'
                            }}>
                              Overdue
                            </span>
                          )}
                          <span style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            color: '#666',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            Round {assignment.round}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #e5e5e5'
                      }}>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Submission Date:
                          </span>
                          <p style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#333',
                            margin: 0
                          }}>
                            {formatDate(assignment.submittedAtSubmission)}
                          </p>
                        </div>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Due Date:
                          </span>
                          <p style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#333',
                            margin: 0
                          }}>
                            {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Days Remaining:
                          </span>
                          <p style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: daysColors.color,
                            margin: 0
                          }}>
                            {daysRemaining === null
                              ? 'N/A'
                              : daysRemaining > 0
                              ? `${daysRemaining} days`
                              : `${Math.abs(daysRemaining)} days overdue`}
                          </p>
                        </div>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Assignment ID:
                          </span>
                          <p style={{
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            color: '#333',
                            margin: 0
                          }}>
                            #{assignment.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      {assignment.abstract && (
                        <div style={{
                          marginBottom: '1rem',
                          paddingBottom: '1rem',
                          borderBottom: '1px solid #e5e5e5'
                        }}>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#666',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Abstract:
                          </span>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#333',
                            margin: 0,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {assignment.abstract}
                          </p>
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '0.75rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => router.push(`/reviewer/assignments/${assignment.id}`)}
                            style={{
                              fontSize: '0.875rem',
                              padding: '0.5rem 1rem',
                              backgroundColor: 'transparent',
                              border: '1px solid #d5d5d5',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#006798',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <Eye style={{ width: '1rem', height: '1rem' }} />
                            View Details
                          </button>
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          {(assignment.status === 'pending' || assignment.status === 'accepted') && !assignment.submittedAt && (
                            <button
                              onClick={() => router.push(`/reviewer/assignments/${assignment.id}`)}
                              style={{
                                backgroundColor: '#006798',
                                color: '#fff',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.5rem 1rem',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              {assignment.status === 'pending' ? 'Start Review' : 'Continue Review'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(ReviewerAssignments, 'reviewer')
