import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserRoles } from '@/lib/db'

// Define protected routes and their required roles
// Manager can only access site-management, not full admin panel
const PROTECTED_ROUTES = {
  '/admin/site-management': ['admin', 'manager'], // Manager can access site management
  '/admin/journals': ['admin', 'manager'], // Manager can access journal settings
  '/admin/site-settings': ['admin'], // Only admin can access site settings
  '/admin/system': ['admin'], // Only admin can access system functions
  '/admin/users': ['admin'], // Only admin can access users management
  '/admin/statistics': ['admin', 'manager'], // Manager can view statistics
  '/admin': ['admin'], // Root admin page - only admin
  '/manager': ['manager', 'admin'],
  '/editor': ['editor', 'section_editor', 'admin'],
  '/assistant': ['assistant', 'admin'],
  '/section-editor': ['section_editor', 'editor', 'admin'],
  '/reviewer': ['reviewer', 'admin'],
  '/author': ['author', 'admin'],
  '/copyeditor': ['copyeditor', 'admin'],
  '/layout-editor': ['layout-editor', 'admin'],
  '/proofreader': ['proofreader', 'admin'],
  '/subscription-manager': ['subscription-manager', 'admin'],
}

// API routes that need protection
const PROTECTED_API_ROUTES = [
  '/api/admin',
  '/api/editor',
  '/api/manager',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is a protected route
  // Priority: more specific routes first (longer paths)
  let requiredRoles: string[] | null = null
  let matchedRoute = ''

  // Sort routes by length (longest first) to prioritize specific routes
  const sortedRoutes = Object.entries(PROTECTED_ROUTES).sort((a, b) => b[0].length - a[0].length)

  // Check main protected routes - more specific routes checked first
  for (const [route, roles] of sortedRoutes) {
    if (pathname.startsWith(route)) {
      requiredRoles = roles;

      try {
        // Create Supabase server client
        const supabase = await createSupabaseServerClient()

        // Get session from Supabase
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          // No valid session, redirect to login
          const url = new URL('/login', request.url)
          url.searchParams.set('redirectTo', pathname)
          return NextResponse.redirect(url)
        }

        // Get user roles directly from database
        // Important: Supabase Auth user.id might differ from user_accounts.id
        // So we need to get the correct user_id from database using email or metadata
        let userRoles: string[] = []

        try {
          // Try to get user_id from metadata first (stored during login)
          let dbUserId = session.user.user_metadata?.user_id
          console.log(`[Middleware] Checking access for ${pathname}, Supabase user.id: ${session.user.id}, metadata user_id: ${dbUserId}`)

          // If not in metadata, find user by email from database
          if (!dbUserId) {
            const { getUserByEmail } = await import('@/lib/db')
            const email = session.user.email || ''
            console.log(`[Middleware] Searching for email: '${email}' (Length: ${email.length})`)
            const userData = await getUserByEmail(email)
            dbUserId = userData?.user_id
            console.log(`[Middleware] Found user by email: ${dbUserId}`)
          }

          // If still no user_id, use Supabase Auth user.id as fallback
          if (!dbUserId) {
            dbUserId = session.user.id
            console.log(`[Middleware] Using Supabase user.id as fallback: ${dbUserId}`)
          }

          // Get roles from database using the correct user_id
          const { getUserRoles } = await import('@/lib/db')
          const roles = await getUserRoles(dbUserId)
          userRoles = roles.map(role => role.role_path)
          console.log(`[Middleware] User roles from database for ${dbUserId}: [${userRoles.join(', ')}]`)
        } catch (error) {
          console.error('[Middleware] Error getting user roles from database:', error)
          // Fallback: try to get from Supabase user metadata (might not have roles)
          if (session.user.user_metadata?.roles) {
            userRoles = session.user.user_metadata.roles.map((role: any) => role.role_path || role.user_group_name || '')
            console.log(`[Middleware] Using roles from metadata: [${userRoles.join(', ')}]`)
          }
        }

        // Check if user has required role
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
        console.log(`[Middleware] Path: ${pathname}, Matched route: ${matchedRoute}, Required roles: [${requiredRoles.join(', ')}], User roles: [${userRoles.join(', ')}], Has role: ${hasRequiredRole}`)

        if (!hasRequiredRole) {
          console.log(`[Middleware] Access denied: User ${session.user.id} with roles [${userRoles.join(', ')}] does not have required roles [${requiredRoles.join(', ')}] for ${pathname} (matched route: ${matchedRoute})`)
          // User doesn't have required role, redirect to unauthorized
          return NextResponse.redirect(new URL('/unauthorized', request.url))
        }

        console.log(`[Middleware] Access granted for ${pathname} (matched route: ${matchedRoute})`)

        // User has required role, allow access
        return NextResponse.next()

      } catch (error) {
        console.error('Middleware error:', error)
        // On error, redirect to login
        const url = new URL('/login', request.url)
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login and unauthorized pages
     * - dashboard (accessible to all authenticated users)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|login|unauthorized).*)',
  ],
}