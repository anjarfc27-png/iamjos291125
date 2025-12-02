'use client'

import { withAuth } from '@/lib/auth-client'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function ReviewerSubmissionsPage() {
  const router = useRouter()
  const supabase = useSupabase()
  const [submissions, setSubmissions] = useState<{ 
    id: string; 
    title: string; 
    journal: string; 
    dueDate: string; 
    status: string;
    round: number;
  }[]>(
    USE_DUMMY ? [
      { id: 'REV-001', title: 'AI in Education: A Comprehensive Review', journal: 'Journal of Educational Technology', dueDate: '2025-12-15', status: 'pending', round: 1 },
      { id: 'REV-002', title: 'Machine Learning Applications in Healthcare', journal: 'Medical Informatics Journal', dueDate: '2025-12-20', status: 'in_progress', round: 2 },
      { id: 'REV-003', title: 'Blockchain Technology for Supply Chain', journal: 'Technology and Innovation', dueDate: '2025-12-10', status: 'completed', round: 1 }
    ] : []
  )
  const [loading, setLoading] = useState(!USE_DUMMY)

  useEffect(() => {
    if (USE_DUMMY) return
    const load = async () => {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get reviewer assignments with submission details
        const { data: assignments } = await supabase
          .from('submission_reviews')
          .select('id, submission_review_rounds!inner(submissions!inner(id, title, journal_id), review_round), due_date, status')
          .eq('reviewer_id', user.id)
          .order('due_date', { ascending: true })

        if (!assignments?.length) {
          setSubmissions([])
          setLoading(false)
          return
        }

        const submissionIds = assignments
          .map((a: any) => a.submission_review_rounds?.submissions?.id)
          .filter(Boolean)
        const journalIds = Array.from(new Set(
          assignments
            .map((a: any) => a.submission_review_rounds?.submissions?.journal_id)
            .filter(Boolean)
        ))

        // Get journal names
        const { data: journals } = await supabase
          .from('journals')
          .select('id, title')
          .in('id', journalIds)

        const journalMap = new Map((journals ?? []).map(j => [j.id, j.title]))

        const result = assignments.map((a: any) => {
          const submission = a.submission_review_rounds?.submissions
          const round = a.submission_review_rounds?.review_round?.round || 1
          return {
            id: String(a.id),
            title: String(submission?.title ?? 'Untitled'),
            journal: String(journalMap.get(submission?.journal_id) ?? 'Unknown Journal'),
            dueDate: a.due_date ? new Date(a.due_date).toISOString().split('T')[0] : '',
            status: String(a.status ?? 'pending'),
            round: Number(round)
          }
        })

        setSubmissions(result)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { backgroundColor: '#fff3cd', color: '#856404' }
      case 'in_progress':
      case 'accepted':
        return { backgroundColor: '#d1ecf1', color: '#0c5460' }
      case 'completed':
        return { backgroundColor: '#d4edda', color: '#155724' }
      case 'declined':
        return { backgroundColor: '#e2e3e5', color: '#383d41' }
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41' }
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress':
      case 'accepted': return 'In Progress'
      case 'completed': return 'Completed'
      case 'declined': return 'Declined'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
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
          Manuscripts assigned for peer review
        </p>
      </div>

      {/* Table - OJS PKP 3.3 Style */}
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
            Assigned Submissions
          </h2>
        </div>
        {loading ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666',
            fontStyle: 'italic'
          }}>
            Loading assignments...
          </div>
        ) : submissions.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#666',
            fontStyle: 'italic'
          }}>
            No review assignments found.
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
                    ID
                  </th>
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
                    Round
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Due Date
                  </th>
                  <th style={{
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#002C40',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    Status
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
                {submissions.map((s, index) => {
                  const statusStyle = getStatusBadgeStyle(s.status)
                  return (
                    <tr key={s.id} style={{
                      borderBottom: index < submissions.length - 1 ? '1px solid #e5e5e5' : 'none',
                      backgroundColor: '#fff'
                    }}>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        #{s.id.slice(0, 8)}...
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#002C40',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {s.title}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {s.journal}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        Round {s.round}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {formatDate(s.dueDate)}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.125rem 0.5rem',
                          fontSize: '0.75rem',
                          borderRadius: '4px',
                          backgroundColor: statusStyle.backgroundColor,
                          color: statusStyle.color,
                          fontWeight: 600
                        }}>
                          {getStatusLabel(s.status)}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => router.push(`/reviewer/assignments/${s.id}`)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: 'transparent',
                              border: '1px solid #d5d5d5',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#006798'
                            }}
                          >
                            View
                          </button>
                          {(s.status === 'pending' || s.status === 'accepted') && (
                            <button
                              onClick={() => router.push(`/reviewer/assignments/${s.id}`)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: '#006798',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#fff'
                              }}
                            >
                              {s.status === 'pending' ? 'Start Review' : 'Continue'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default withAuth(ReviewerSubmissionsPage, 'reviewer')
