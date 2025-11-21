'use client'

import { withAuth } from '@/lib/auth-client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle, ClipboardList, Eye } from 'lucide-react'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'

function CopyeditorDashboard() {
  const supabase = useSupabase()
  const tasks = USE_DUMMY ? [
    { id: 'CE-001', title: 'Manuskrip: Pengaruh AI pada Pendidikan', journal: 'Jurnal Teknologi Informasi', stage: 'copyediting', due: '2025-11-28' },
    { id: 'CE-002', title: 'Analisis Data Kesehatan Masyarakat', journal: 'Jurnal Kesehatan', stage: 'copyediting', due: '2025-11-30' }
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Copyediting</h1>
        <p className="text-gray-600 mt-1">Tinjau naskah, cek checklist, dan selesaikan tugas copyedit.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Tugas Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Dalam tahap copyediting</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-gray-700"><ClipboardList className="h-4 w-4" /> Gunakan checklist gaya jurnal</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Panduan</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/editor/help" className="text-[#006798] underline">Lihat panduan copyediting</Link>
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
                        <Button variant="secondary" size="sm"><FileText className="h-4 w-4" /></Button>
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

export default withAuth(CopyeditorDashboard, 'copyeditor')
