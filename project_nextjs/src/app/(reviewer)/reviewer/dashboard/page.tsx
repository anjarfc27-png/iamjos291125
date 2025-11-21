import { withAuth } from '@/lib/auth-client'
import { USE_DUMMY } from '@/lib/dummy'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function getReviewerStats(userId: string) {
  if (USE_DUMMY) {
    return {
      pending: 3,
      inProgress: 1,
      completed: 5
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    
    // Get reviewer assignments
    const { data: assignments } = await supabase
      .from('review_assignments')
      .select('id, status')
      .eq('reviewer_id', userId)

    const pending = (assignments ?? []).filter(a => a.status === 'pending').length
    const inProgress = (assignments ?? []).filter(a => a.status === 'in_progress').length
    const completed = (assignments ?? []).filter(a => a.status === 'completed').length

    return { pending, inProgress, completed }
  } catch (error) {
    console.error('Error loading reviewer stats:', error)
    return { pending: 0, inProgress: 0, completed: 0 }
  }
}

async function ReviewerDashboardPage() {
  // Get user from Supabase Auth
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  let userId = null
  
  if (session?.user) {
    // Get user ID from session
    userId = session.user.id
  }

  const stats = userId ? await getReviewerStats(userId) : { pending: 0, inProgress: 0, completed: 0 }

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">Reviewer Dashboard</h2>
        <p className="text-sm text-gray-600">Review & evaluate assigned manuscripts</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700">Pending Assignments</h3>
          <p className="text-2xl font-bold text-[#006798]">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700">In Progress</h3>
          <p className="text-2xl font-bold text-[#006798]">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700">Completed</h3>
          <p className="text-2xl font-bold text-[#006798]">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignments</h3>
        <div className="space-y-3">
          <div className="border border-gray-200 rounded p-3">
            <h4 className="font-medium text-gray-900">Manuscript #2024-001</h4>
            <p className="text-sm text-gray-600 mt-1">Submission Title: Advanced Machine Learning Techniques</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Pending Review
            </span>
          </div>
          <div className="border border-gray-200 rounded p-3">
            <h4 className="font-medium text-gray-900">Manuscript #2024-002</h4>
            <p className="text-sm text-gray-600 mt-1">Submission Title: Climate Change Impact Analysis</p>
            <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              Review In Progress
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default withAuth(ReviewerDashboardPage, 'reviewer')