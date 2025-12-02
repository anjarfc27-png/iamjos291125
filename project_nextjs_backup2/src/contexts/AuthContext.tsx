'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/auth'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    refreshUser()
  }, [])

  const refreshUser = async () => {
    try {
      // Try Supabase session first
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Get user data from our API
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Fallback: create user from Supabase session
          setUser({
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || undefined,
            roles: session.user.user_metadata?.roles || []
          })
        }
      } else {
        // Fallback to our custom session
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        let errorMessage = 'Login failed'
        try {
          const data = await response.json()
          errorMessage = data.error || 'Login failed'
        } catch (jsonError) {
          // If response is not JSON, get text response
          const textResponse = await response.text()
          console.error('Non-JSON error response:', textResponse)
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Logout from Supabase first
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Supabase logout error:', error)
    }
    
    // Then logout from our custom system
    await fetch('/api/auth/logout', {
      method: 'POST',
    })
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}