'use client'

import { withAuth } from '@/lib/auth-client'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function SectionEditorSectionsPage() {
  const supabase = useSupabase()
  const [sections, setSections] = useState<{ 
    id: string; 
    title: string; 
    journal: string; 
    editor: string;
    submissions: number;
    status: string;
  }[]>(
    USE_DUMMY ? [
      { id: 'SEC-001', title: 'Articles', journal: 'Journal of Computer Science', editor: 'Dr. John Smith', submissions: 12, status: 'active' },
      { id: 'SEC-002', title: 'Reviews', journal: 'Journal of Computer Science', editor: 'Dr. Jane Doe', submissions: 5, status: 'active' },
      { id: 'SEC-003', title: 'Case Studies', journal: 'Medical Informatics Journal', editor: 'Dr. Robert Johnson', submissions: 8, status: 'active' }
    ] : []
  )

  useEffect(() => {
    if (USE_DUMMY) return
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get sections where user is section editor
      const { data: sectionAssignments } = await supabase
        .from('section_editors')
        .select('id, section_id, journal_id')
        .eq('user_id', user.id)

      if (!sectionAssignments?.length) return

      const sectionIds = sectionAssignments.map(sa => sa.section_id)
      const journalIds = Array.from(new Set(sectionAssignments.map(sa => sa.journal_id)))

      // Get section details
      const { data: sectionsData } = await supabase
        .from('sections')
        .select('id, title, journal_id')
        .in('id', sectionIds)

      // Get journal names
      const { data: journals } = await supabase
        .from('journals')
        .select('id, title')
        .in('id', journalIds)

      const journalMap = new Map((journals ?? []).map(j => [j.id, j.title]))

      // Get section editors info
      const { data: editors } = await supabase
        .from('section_editors')
        .select('section_id, user_id, users(email)')
        .in('section_id', sectionIds)

      // Get submission counts per section
      const { data: submissions } = await supabase
        .from('submissions')
        .select('id, section_id, current_stage')
        .in('section_id', sectionIds)

      const submissionCounts = (submissions ?? []).reduce((acc, sub) => {
        acc[sub.section_id] = (acc[sub.section_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const result = (sectionsData ?? []).map(s => {
        const editor = editors?.find(e => e.section_id === s.id)
        return {
          id: String(s.id),
          title: String(s.title ?? 'Untitled Section'),
          journal: String(journalMap.get(s.journal_id) ?? 'Unknown Journal'),
          editor: editor?.users?.[0]?.email ?? 'No Editor Assigned',
          submissions: submissionCounts[s.id] || 0,
          status: 'active'
        }
      })

      setSections(result)
    }
    load()
  }, [supabase])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Section Management</h2>
          <p className="text-sm text-gray-600">Manage sections assigned to you as section editor</p>
        </div>
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Assigned Sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Section</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Journal</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Editor</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Submissions</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2 text-sm font-medium">{s.title}</td>
                    <td className="px-4 py-2 text-sm">{s.journal}</td>
                    <td className="px-4 py-2 text-sm">{s.editor}</td>
                    <td className="px-4 py-2 text-sm">{s.submissions}</td>
                    <td className="px-4 py-2 text-sm">{getStatusBadge(s.status)}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">View Submissions</Button>
                        <Button variant="secondary" size="sm">Edit Section</Button>
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

export default withAuth(SectionEditorSectionsPage, 'section_editor')