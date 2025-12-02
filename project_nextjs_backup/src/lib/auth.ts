import { NextRequest, NextResponse } from 'next/server'
// Lazily import DB helpers in server-only functions to avoid client-side evaluation

export interface User {
  id: string
  username: string
  email: string
  full_name?: string
  roles: UserRole[]
}

export interface UserRole {
  user_group_id: string
  user_group_name: string
  context_id?: string
  journal_name?: string
  role_path: string
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const sessionToken = request.cookies.get('session-token')?.value
    if (!sessionToken) return null

    // Decode session token to get user ID
    const decoded = Buffer.from(sessionToken, 'base64').toString()
    const userId = decoded.split(':')[0]

    // Get user data from database
    const { getUserById, getUserRoles } = await import('./db')
    const userData = await getUserById(userId)
    if (!userData) return null

    // Get user roles
    const roles = await getUserRoles(userId)

    return {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      roles
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export function getRolePath(userGroupName: string): string {
  // Normalize input to handle case variations
  const normalized = userGroupName?.trim() || ''
  
  const rolePaths: Record<string, string> = {
    'site admin': 'admin',
    'manager': 'manager',
    'editor': 'editor',
    'section editor': 'section_editor',
    'assistant': 'assistant',
    'copyeditor': 'copyeditor',
    'proofreader': 'proofreader',
    'layout editor': 'layout-editor',
    'author': 'author',
    'reviewer': 'reviewer',
    'reader': 'reader',
    'subscription manager': 'subscription-manager'
  }
  
  // Try exact match first (case-insensitive)
  const lowerNormalized = normalized.toLowerCase()
  if (rolePaths[lowerNormalized]) {
    return rolePaths[lowerNormalized]
  }
  
  // Try with original case
  if (rolePaths[userGroupName]) {
    return rolePaths[userGroupName]
  }
  
  // Fallback to reader
  return 'reader'
}

export function hasRole(user: User | null, rolePath: string, contextId?: string): boolean {
  if (!user) return false
  return user.roles.some(role => 
    role.role_path === rolePath && 
    (!contextId || role.context_id === contextId)
  )
}

export function hasAnyRole(user: User | null, rolePaths: string[]): boolean {
  if (!user) return false
  return user.roles.some(role => rolePaths.includes(role.role_path))
}

export function getUserRolesForUser(user: User | null, contextId?: string): UserRole[] {
  if (!user) return []
  if (!contextId) return user.roles
  return user.roles.filter(role => role.context_id === contextId)
}

export async function withAuth(
  handler: (request: NextRequest, user: User) => Promise<NextResponse>,
  requiredRole?: string
) {
  return async (request: NextRequest) => {
    try {
      const user = await getCurrentUser(request)
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (requiredRole && !hasRole(user, requiredRole)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return await handler(request, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}