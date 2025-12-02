'use client'

import { withAuth } from '@/lib/auth-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'

function SubscriptionManagerHomePage() {
  const supabase = useSupabase()
  const subs = USE_DUMMY ? [
    { id: 'SUB-001', user: 'reader1@ojs.local', type: 'Institutional', status: 'Active', expires: '2026-01-01' },
    { id: 'SUB-002', user: 'reader2@ojs.local', type: 'Individual', status: 'Expired', expires: '2024-12-31' }
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
        <p className="text-gray-600 mt-1">Kelola langganan dan kontrol akses pembaca.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Langganan Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{subs.filter(s => s.status === 'Active').length}</div>
            </CardContent>
          </Card>
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Kedaluwarsa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{subs.filter(s => s.status !== 'Active').length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white mt-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Langganan</h2>
              <Button size="sm">Tambah Langganan</Button>
            </div>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Pengguna</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Jenis</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Kedaluwarsa</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="px-4 py-2 text-sm">{s.id}</td>
                    <td className="px-4 py-2 text-sm">{s.user}</td>
                    <td className="px-4 py-2 text-sm">{s.type}</td>
                    <td className="px-4 py-2 text-sm">
                      <Badge variant={s.status === 'Active' ? 'default' : 'outline'}>{s.status}</Badge>
                    </td>
                    <td className="px-4 py-2 text-sm">{s.expires}</td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="secondary" size="sm">Renew</Button>
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

export default withAuth(SubscriptionManagerHomePage, ['subscription-manager'])
