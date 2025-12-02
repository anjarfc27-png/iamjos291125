'use client';

import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/auth-client';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';

type ReviewHistory = {
  id: string;
  title: string;
  authors: string;
  journal: string;
  submittedDate: string;
  completedDate: string;
  recommendation: string;
};

function ReviewerHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch('/api/reviewer/assignments?filter=completed', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.ok && data.assignments) {
          const historyData: ReviewHistory[] = data.assignments.map((a: any) => ({
            id: a.id,
            title: a.submissionTitle,
            authors: a.authorNames || 'Unknown',
            journal: a.journalTitle || 'Unknown',
            submittedDate: a.assignmentDate ? new Date(a.assignmentDate).toISOString().split('T')[0] : 'N/A',
            completedDate: a.submittedAt ? new Date(a.submittedAt).toISOString().split('T')[0] : 'N/A',
            recommendation: a.recommendation || 'No recommendation',
          }));
          setHistory(historyData);
        }
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [user?.id]);

  const getRecommendationBadge = (recommendation: string) => {
    const lower = recommendation.toLowerCase();
    if (lower.includes('accept')) return { bg: '#d4edda', color: '#155724' };
    if (lower.includes('minor')) return { bg: '#d1ecf1', color: '#0c5460' };
    if (lower.includes('major')) return { bg: '#fff3cd', color: '#856404' };
    if (lower.includes('reject')) return { bg: '#f8d7da', color: '#721c24' };
    return { bg: '#e2e3e5', color: '#383d41' };
  };

  if (loading) {
    return (
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <div style={{ borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#002C40', margin: 0 }}>Review History</h1>
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
            Review History
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            View your complete review history
          </p>
        </div>
      </div>

      {/* Review History List - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: '#002C40',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          Completed Review History
        </h2>
        {history.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#666',
            fontSize: '0.875rem'
          }}>
            <FileText style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#ccc' }} />
            <p style={{ margin: 0, fontStyle: 'italic' }}>No review history available.</p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {history.map((item) => {
              const badgeColors = getRecommendationBadge(item.recommendation);
              return (
                <div 
                  key={item.id} 
                  style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '1rem',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <Link
                        href={`/reviewer/assignments/${item.id}`}
                        style={{ 
                          color: '#006798', 
                          textDecoration: 'none', 
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        <h3 style={{
                          fontWeight: 500,
                          fontSize: '1rem',
                          color: '#002C40',
                          margin: 0,
                          marginBottom: '0.5rem'
                        }}>
                          {item.title}
                        </h3>
                      </Link>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {item.authors}
                      </p>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        margin: 0
                      }}>
                        {item.journal}
                      </p>
                    </div>
                    <span style={{
                      backgroundColor: badgeColors.bg,
                      color: badgeColors.color,
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      fontWeight: 600,
                      display: 'inline-block'
                    }}>
                      {item.recommendation}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span>Submitted: {item.submittedDate}</span>
                      <span>Completed: {item.completedDate}</span>
                    </div>
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
                      Completed
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <Link 
                      href={`/reviewer/assignments/${item.id}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #d5d5d5',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#006798',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      <Eye style={{ width: '1rem', height: '1rem' }} />
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ReviewerHistory, 'reviewer');
