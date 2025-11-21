'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/navigation'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#eaedee]">
      <Navigation />
      
      <header className="bg-[#002C40] text-white border-t border-[#003d55]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm opacity-80">Welcome, {user.full_name || user.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Your Roles & Access</h2>
          <div className="space-y-2">
            {user.roles.map((role, idx) => (
              <div key={`${role.user_group_id}-${idx}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{role.user_group_name}</span>
                <span className="text-sm text-gray-600">{role.journal_name || 'Site-wide'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user.roles.some(r => r.role_path === 'admin') && (
            <a href="/admin" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Site Administration</h3>
              <p className="text-gray-600 mt-2">Manage site settings, journals, and users</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'manager') && (
            <a href="/manager" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Journal Manager</h3>
              <p className="text-gray-600 mt-2">Access editorial dashboard and journal settings</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'editor' || r.role_path === 'section_editor') && (
            <a href="/editor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Editor Dashboard</h3>
              <p className="text-gray-600 mt-2">Manage submissions and editorial workflow</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'copyeditor') && (
            <a href="/copyeditor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Copyeditor</h3>
              <p className="text-gray-600 mt-2">Work on manuscripts in copyediting stage</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'proofreader') && (
            <a href="/proofreader" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Proofreader</h3>
              <p className="text-gray-600 mt-2">Handle proofs in production stage</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'layout-editor') && (
            <a href="/layout-editor" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Layout Editor</h3>
              <p className="text-gray-600 mt-2">Prepare layout in production stage</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'author') && (
            <a href="/author" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Author Dashboard</h3>
              <p className="text-gray-600 mt-2">Submit and track your manuscripts</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'reviewer') && (
            <a href="/reviewer" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Reviewer Dashboard</h3>
              <p className="text-gray-600 mt-2">Review assigned manuscripts</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'subscription-manager') && (
            <a href="/subscription-manager" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Subscription Manager</h3>
              <p className="text-gray-600 mt-2">Manage subscriptions and access control</p>
            </a>
          )}

          {user.roles.some(r => r.role_path === 'reader') && (
            <a href="/reader" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold text-[#002C40]">Reader</h3>
              <p className="text-gray-600 mt-2">Browse published content</p>
            </a>
          )}
        </div>
      </main>
    </div>
  )
}