
'use client'

import { withAuth } from '@/lib/auth-client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle } from 'lucide-react'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'

function ProofreaderDashboard() {
  const supabase = useSupabase()
  const [tasks, setTasks] = useState<{ id: string; title: string; journal: string; due: string }[]>(
    USE_DUMMY
      ? [
          { id: 'PR-21', title: 'Proof – Issue 3(1) 2025', journal: 'Jurnal Pendidikan', due: '2025-12-10' }
        ]
      : []
  )

  useEffect(() => {
    if (USE_DUMMY) return
    const load = async () => {
      const { data: subs } = await supabase
        .from('submissions')
        .select('id,title,journal_id,current_stage')
        .eq('current_stage', 'production')
        .order('updated_at', { ascending: false })
      const jids = Array.from(new Set((subs ?? []).map(s => s.journal_id)))
      let jmap = new Map<string, string>()
      if (jids.length) {
        const { data: js } = await supabase.from('journals').select('id,title').in('id', jids)
        (js ?? []).forEach(j => jmap.set(String(j.id), String(j.title ?? '')))
      }
      const next = (subs ?? []).map(s => ({
        id: String(s.id),
        title: String(s.title ?? ''),
        journal: jmap.get(String(s.journal_id)) ?? 'Journal',
        due: ''
      }))
      setTasks(next)
    }
    load()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Proofreading</h1>
        <p className="text-gray-600 mt-1">Periksa ejaan, typografi, dan konsistensi metadata.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Tugas Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Menunggu proofreading</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Panduan</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/editor/help" className="text-[#006798] underline">Lihat panduan proofreading</Link>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white mt-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Tugas</h2>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Judul</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Jurnal</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tempo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{t.id}</td>
                    <td className="px-4 py-2 text-sm">{t.title}</td>
                    <td className="px-4 py-2 text-sm">{t.journal}</td>
                    <td className="px-4 py-2 text-sm">{t.due}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                        <Button size="sm"><CheckCircle className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(ProofreaderDashboard, 'proofreader')
