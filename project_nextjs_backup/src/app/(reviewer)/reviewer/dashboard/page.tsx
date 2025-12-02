import { redirect } from 'next/navigation'
import Link from 'next/link'

import { USE_DUMMY } from '@/lib/dummy'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getUserRoles } from '@/lib/db'
import { Clock, CheckCircle, FileText } from 'lucide-react'

async function getReviewerStats(userId: string) {
  try {
    const supabase = getSupabaseAdminClient()
    
    // Get reviewer assignments
    const { data: assignments } = await supabase
      .from('submission_reviews')
      .select('id, status, submitted_at, assignment_date, submission_review_rounds!inner(submissions!inner(id, title, metadata))')
      .eq('reviewer_id', userId)
      .order('assignment_date', { ascending: false })
      .limit(10)

    const pending = (assignments ?? []).filter(a => a.status === 'pending').length
    const inProgress = (assignments ?? []).filter(a => (a.status === 'accepted' || a.status === 'in_progress') && !a.submitted_at).length
    const completed = (assignments ?? []).filter(a => a.status === 'completed' || a.submitted_at !== null).length

    // Get recent assignments for display
    const recentAssignments = (assignments ?? []).slice(0, 5).map((a: any) => {
      const submission = a.submission_review_rounds?.submissions
      return {
        id: a.id,
        submissionId: submission?.id,
        title: submission?.title || 'Untitled',
        status: a.status,
        assignmentDate: a.assignment_date,
      }
    })

    return { pending, inProgress, completed, recentAssignments }
  } catch (error) {
    console.error('Error loading reviewer stats:', error)
    return { pending: 0, inProgress: 0, completed: 0, recentAssignments: [] }
  }
}

async function ReviewerDashboardPage() {
  // Get user from Supabase Auth
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Check authentication
  if (!session?.user) {
    redirect('/login')
  }

  // Map Supabase Auth user ke user_accounts seperti di middleware
  let dbUserId: string | null | undefined = session.user.user_metadata?.user_id

  if (!dbUserId && session.user.email) {
    try {
      const { getUserByEmail } = await import('@/lib/db')
      const userData = await getUserByEmail(session.user.email)
      dbUserId = userData?.user_id
    } catch (error) {
      console.error('Error resolving reviewer dbUserId by email:', error)
    }
  }

  if (!dbUserId) {
    dbUserId = session.user.id
  }

  // Check reviewer role (server-side, multi-role aware)
  const roles = await getUserRoles(dbUserId)
  const hasReviewerRole = roles.some((role) => role.role_path === 'reviewer') || USE_DUMMY
  
  if (!hasReviewerRole) {
    redirect('/dashboard')
  }

  const userId = dbUserId
  const stats = await getReviewerStats(userId)

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
            Reviewer Dashboard
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Review & evaluate assigned manuscripts
          </p>
        </div>
      </div>

      {/* Stats Cards - OJS PKP 3.3 Style */}
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
              Pending Assignments
            </h3>
            <Clock style={{ width: '1rem', height: '1rem', color: '#ff9800' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#ff9800',
            marginBottom: '0.25rem'
          }}>
            {stats.pending}
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
              In Progress
            </h3>
            <FileText style={{ width: '1rem', height: '1rem', color: '#006798' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {stats.inProgress}
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
              Completed
            </h3>
            <CheckCircle style={{ width: '1rem', height: '1rem', color: '#00B24E' }} />
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: '#00B24E',
            marginBottom: '0.25rem'
          }}>
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Recent Assignments - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '1rem'
        }}>
          Recent Assignments
        </h2>
        {stats.recentAssignments.length === 0 ? (
          <p style={{
            textAlign: 'center',
            padding: '2rem',
            fontSize: '0.875rem',
            color: '#666',
            fontStyle: 'italic',
            margin: 0
          }}>
            No recent assignments
          </p>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {stats.recentAssignments.map((assignment: any) => (
              <Link
                key={assignment.id}
                href={`/reviewer/assignments/${assignment.id}`}
                style={{
                  display: 'block',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background-color 0.2s',
                  backgroundColor: '#fff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <h4 style={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: '#002C40',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  {assignment.title}
                </h4>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  margin: 0,
                  marginBottom: '0.75rem'
                }}>
                  Assigned: {new Date(assignment.assignmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '4px',
                  fontWeight: 600,
                  backgroundColor: assignment.status === 'pending' 
                    ? '#fff3cd'
                    : assignment.status === 'completed'
                    ? '#d4edda'
                    : '#d1ecf1',
                  color: assignment.status === 'pending' 
                    ? '#856404'
                    : assignment.status === 'completed'
                    ? '#155724'
                    : '#0c5460'
                }}>
                  {assignment.status === 'pending' ? 'Pending Review' : 
                   assignment.status === 'completed' ? 'Completed' : 
                   'In Progress'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewerDashboardPage