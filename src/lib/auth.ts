import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    const token = request.cookies.get('sb-access-token')?.value
    if (!token) return null

    const { data: { user: authUser }, error } = await supabase.auth.getUser(token)
    if (error || !authUser) return null

    // Get user data from OJS tables
    const { data: userData } = await supabase
      .from('users')
      .select('user_id, username, email, first_name, last_name')
      .eq('email', authUser.email)
      .single()

    if (!userData) return null

    // Get user roles
    const { data: userGroups } = await supabase
      .from('user_user_groups')
      .select(`
        user_group_id,
        user_groups!inner(
          user_group_id,
          user_group_name,
          context_id,
          journals!inner(journal_id, settings)
        )
      `)
      .eq('user_id', userData.user_id)

    const roles: UserRole[] = userGroups?.map(ug => ({
      user_group_id: ug.user_group_id,
      user_group_name: ug.user_groups.user_group_name,
      context_id: ug.user_groups.context_id,
      journal_name: ug.user_groups.journals?.settings?.find((s: any) => s.setting_name === 'name')?.setting_value || 'Site',
      role_path: getRolePath(ug.user_groups.user_group_name)
    })) || []

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

function getRolePath(userGroupName: string): string {
  const rolePaths: Record<string, string> = {
    'Site admin': 'admin',
    'Manager': 'manager',
    'Editor': 'editor',
    'Section editor': 'editor', // Map Section editor ke editor path untuk OJS compatibility
    'Copyeditor': 'copyeditor',
    'Proofreader': 'proofreader',
    'Layout Editor': 'layout-editor',
    'Author': 'author',
    'Reviewer': 'reviewer',
    'Reader': 'reader',
    'Subscription manager': 'subscription-manager'
  }
  return rolePaths[userGroupName] || 'reader'
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

export function getUserRoles(user: User | null, contextId?: string): UserRole[] {
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