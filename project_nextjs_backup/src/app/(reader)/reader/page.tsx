'use client'

import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Search, FileText, Eye } from 'lucide-react'

export default function ReaderHomePage() {
  const { user } = useAuth()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{fontSize: '1.875rem', fontWeight: 'bold'}}>
          Reader Dashboard
        </h1>
        <p className="text-gray-600" style={{fontSize: '1.125rem'}}>
          Welcome, {user?.full_name || user?.username || 'Reader'}. Browse and read published articles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#002C40] bg-opacity-10 p-3 rounded-lg">
              <BookOpen className="h-8 w-8 text-[#002C40]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900" style={{fontSize: '1.25rem', fontWeight: '600'}}>
                Browse Journals
              </h3>
              <p className="text-gray-600 text-sm">Explore available journals</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#002C40] bg-opacity-10 p-3 rounded-lg">
              <Search className="h-8 w-8 text-[#002C40]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900" style={{fontSize: '1.25rem', fontWeight: '600'}}>
                Search Articles
              </h3>
              <p className="text-gray-600 text-sm">Find specific articles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#002C40] bg-opacity-10 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-[#002C40]" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900" style={{fontSize: '1.25rem', fontWeight: '600'}}>
                Reading List
              </h3>
              <p className="text-gray-600 text-sm">Manage your saved articles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}