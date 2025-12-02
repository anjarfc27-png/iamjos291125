'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function hasRole(user: { roles: { role_path: string; context_id?: string }[] } | null, rolePath: string, contextId?: string) {
  if (!user) return false
  return user.roles.some(r => r.role_path === rolePath && (!contextId || r.context_id === contextId))
}

export function hasAnyRole(user: { roles: { role_path: string }[] } | null, rolePaths: string[]) {
  if (!user) return false
  return user.roles.some(r => rolePaths.includes(r.role_path))
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: string | string[]
) {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login?source=' + encodeURIComponent(window.location.pathname))
      } else if (!loading && user && requiredRole) {
        const hasRequiredRole = Array.isArray(requiredRole) 
          ? requiredRole.some(role => hasRole(user, role))
          : hasRole(user, requiredRole)
        
        if (!hasRequiredRole) {
          router.push('/unauthorized')
        }
      }
    }, [user, loading, router, requiredRole])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006798] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006798] mx-auto"></div>
            <p className="mt-4 text-gray-600">Redirecting...</p>
          </div>
        </div>
      )
    }

    if (requiredRole) {
      const hasRequiredRole = Array.isArray(requiredRole) 
        ? requiredRole.some(role => hasRole(user, role))
        : hasRole(user, requiredRole)
      
      if (!hasRequiredRole) {
        return (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="mt-4 text-gray-600">Redirecting...</p>
            </div>
          </div>
        )
      }
    }

    return <Component {...props} />
  }
}