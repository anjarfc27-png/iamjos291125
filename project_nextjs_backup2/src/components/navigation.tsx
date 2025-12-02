'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <nav className="app__nav bg-[#002C40] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-lg font-semibold">
              OJS 3.3
            </Link>
            
            <div className="flex space-x-4">
              {user.roles.some(r => r.role_path === 'manager') && (
                <Link 
                  href="/manager" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/manager') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Manager
                </Link>
              )}
              {user.roles.some(r => r.role_path === 'admin') && (
                <Link 
                  href="/admin" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/admin') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Administration
                </Link>
              )}
              
              {user.roles.some(r => r.role_path === 'editor') && (
                <Link 
                  href="/editor" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/editor') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Editorial
                </Link>
              )}

              {user.roles.some(r => r.role_path === 'copyeditor') && (
                <Link 
                  href="/copyeditor" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/copyeditor') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Copyeditor
                </Link>
              )}

              {user.roles.some(r => r.role_path === 'proofreader') && (
                <Link 
                  href="/proofreader" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/proofreader') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Proofreader
                </Link>
              )}

              {user.roles.some(r => r.role_path === 'layout-editor') && (
                <Link 
                  href="/layout-editor" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/layout-editor') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Layout Editor
                </Link>
              )}
              
              {user.roles.some(r => r.role_path === 'author') && (
                <Link 
                  href="/author" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/author') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Author
                </Link>
              )}
              
              {user.roles.some(r => r.role_path === 'reviewer') && (
                <Link 
                  href="/reviewer" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/reviewer') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Reviewer
                </Link>
              )}

              {user.roles.some(r => r.role_path === 'subscription-manager') && (
                <Link 
                  href="/subscription-manager" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/subscription-manager') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Subscription
                </Link>
              )}

              {user.roles.some(r => r.role_path === 'reader') && (
                <Link 
                  href="/reader" 
                  className={`px-3 py-2 rounded text-sm font-medium hover:bg-[#003d55] ${
                    isActive('/reader') ? 'bg-[#003d55]' : ''
                  }`}
                >
                  Reader
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user.full_name || user.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}