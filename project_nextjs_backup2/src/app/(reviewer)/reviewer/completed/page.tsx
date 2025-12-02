'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, Eye } from 'lucide-react';
import { withAuth } from '@/lib/auth-client';
import Link from 'next/link';

type CompletedReview = {
  id: string;
  submissionId: string;
  title: string;
  authors: string;
  journal: string;
  completionDate: string;
  recommendation: string;
  reviewTime: number;
};

function ReviewerCompleted() {
  const { user } = useAuth();
  const [completedReviews, setCompletedReviews] = useState<CompletedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompletedReviews() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch('/api/reviewer/assignments?filter=completed', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.ok && data.assignments) {
          const reviews: CompletedReview[] = data.assignments.map((a: any) => {
            const assignedDate = new Date(a.assignmentDate);
            const completedDate = new Date(a.submittedAt || a.assignmentDate);
            const reviewTime = Math.ceil((completedDate.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));

            return {
              id: a.id,
              submissionId: a.submissionId,
              title: a.submissionTitle,
              authors: a.authorNames || 'Unknown',
              journal: a.journalTitle || 'Unknown',
              completionDate: completedDate.toISOString().split('T')[0],
              recommendation: a.recommendation || 'No recommendation',
              reviewTime,
            };
          });
          setCompletedReviews(reviews);
        }
      } catch (err) {
        console.error('Error loading completed reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    loadCompletedReviews();
  }, [user?.id]);

  const getDecisionColor = (decision: string) => {
    const lower = decision.toLowerCase();
    if (lower.includes('accept')) return { bg: '#d4edda', color: '#155724' };
    if (lower.includes('minor')) return { bg: '#d1ecf1', color: '#0c5460' };
    if (lower.includes('major')) return { bg: '#fff3cd', color: '#856404' };
    if (lower.includes('reject')) return { bg: '#f8d7da', color: '#721c24' };
    return { bg: '#e2e3e5', color: '#383d41' };
  };

  const acceptRate = completedReviews.length > 0
    ? Math.round((completedReviews.filter(r => r.recommendation.toLowerCase().includes('accept')).length / completedReviews.length) * 100)
    : 0;
  
  const avgReviewTime = completedReviews.length > 0
    ? Math.round(completedReviews.reduce((sum, r) => sum + r.reviewTime, 0) / completedReviews.length)
    : 0;

  if (loading) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <div style={{ borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#002C40', margin: 0 }}>Completed Reviews</h1>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>Loading...</div>
      </div>
    );
  }

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
            Completed Reviews
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            View your completed review assignments
          </p>
        </div>
      </div>

      {/* Summary Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
              Total Completed
            </h3>
            <CheckCircle style={{ width: '1rem', height: '1rem', color: '#00B24E' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#00B24E',
            marginBottom: '0.25rem'
          }}>
            {completedReviews.length}
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
              Accept Rate
            </h3>
            <CheckCircle style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {acceptRate}%
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
              Avg. Review Time
            </h3>
            <Clock style={{ width: '1rem', height: '1rem', color: '#ff9800' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#ff9800',
            marginBottom: '0.25rem'
          }}>
            {avgReviewTime} days
          </div>
        </div>
      </div>

      {/* Reviews Table - OJS PKP 3.3 Style */}
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
            fontSize: '1rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            textTransform: 'uppercase'
          }}>
            Review History
          </h2>
        </div>
        {completedReviews.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666',
            fontStyle: 'italic'
          }}>
            No completed reviews found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e5e5e5'
                }}>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Title
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Authors
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Journal
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Completion Date
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Decision
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Review Time
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedReviews.map((review) => {
                  const decisionColors = getDecisionColor(review.recommendation);
                  return (
                    <tr key={review.id} style={{
                      borderBottom: '1px solid #e5e5e5',
                      backgroundColor: '#fff'
                    }}>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5',
                        maxWidth: '300px'
                      }}>
                        <Link
                          href={`/reviewer/assignments/${review.id}`}
                          style={{ 
                            color: '#006798', 
                            textDecoration: 'none', 
                            fontWeight: 500 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {review.title}
                        </Link>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5',
                        maxWidth: '200px'
                      }}>
                        {review.authors}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
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
                          {review.journal}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {review.completionDate}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        <span style={{
                          backgroundColor: decisionColors.bg,
                          color: decisionColors.color,
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {review.recommendation}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        <span style={{
                          backgroundColor: '#d1ecf1',
                          color: '#0c5460',
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {review.reviewTime} days
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem'
                      }}>
                        <Link 
                          href={`/reviewer/assignments/${review.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #d5d5d5',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#006798',
                            textDecoration: 'none'
                          }}
                        >
                          <Eye style={{ width: '1rem', height: '1rem' }} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ReviewerCompleted, 'reviewer')
