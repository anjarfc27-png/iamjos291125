'use client'

import { withAuth } from '@/lib/auth-client'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function ReviewerSubmissionsPage() {
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

  useEffect(() => {
    if (USE_DUMMY) return
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get reviewer assignments with submission details
      const { data: assignments } = await supabase
        .from('review_assignments')
        .select('id, submission_id, due_date, status, round')
        .eq('reviewer_id', user.id)
        .order('due_date', { ascending: true })

      if (!assignments?.length) return

      const submissionIds = assignments.map(a => a.submission_id)
      
      // Get submission details
      const { data: submissions } = await supabase
        .from('submissions')
        .select('id, title, journal_id')
        .in('id', submissionIds)

      const journalIds = Array.from(new Set((submissions ?? []).map(s => s.journal_id)))
      
      // Get journal names
      const { data: journals } = await supabase
        .from('journals')
        .select('id, title')
        .in('id', journalIds)

      const journalMap = new Map((journals ?? []).map(j => [j.id, j.title]))
      const submissionMap = new Map((submissions ?? []).map(s => [s.id, s]))

      const result = (assignments ?? []).map(a => {
        const submission = submissionMap.get(a.submission_id)
        return {
          id: String(a.id),
          title: String(submission?.title ?? 'Untitled'),
          journal: String(journalMap.get(submission?.journal_id) ?? 'Unknown Journal'),
          dueDate: String(a.due_date ?? '').split('T')[0] ?? '',
          status: String(a.status ?? 'pending'),
          round: Number(a.round ?? 1)
        }
      })

      setSubmissions(result)
    }
    load()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>
      case 'completed':
        return <Badge variant="default">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Review Assignments</h2>
          <p className="text-sm text-gray-600">Manuscripts assigned for peer review</p>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Assigned Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Journal</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Round</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{s.id}</td>
                    <td className="px-4 py-2 text-sm font-medium">{s.title}</td>
                    <td className="px-4 py-2 text-sm">{s.journal}</td>
                    <td className="px-4 py-2 text-sm">Round {s.round}</td>
                    <td className="px-4 py-2 text-sm">{s.dueDate}</td>
                    <td className="px-4 py-2 text-sm">{getStatusBadge(s.status)}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">View</Button>
                        {s.status === 'pending' && (
                          <Button variant="primary" size="sm">Start Review</Button>
                        )}
                        {s.status === 'in_progress' && (
                          <Button variant="secondary" size="sm">Continue</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(ReviewerSubmissionsPage, 'reviewer')
