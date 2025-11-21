import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/admin': ['admin'],
  '/manager': ['manager', 'admin'],
  '/editor': ['editor', 'section_editor', 'admin'],
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
  let requiredRoles: string[] | null = null
  
  // Check main protected routes
  for (const [route, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      requiredRoles = roles
      break
    }
  }

  // Check API routes
  if (!requiredRoles) {
    for (const apiRoute of PROTECTED_API_ROUTES) {
      if (pathname.startsWith(apiRoute)) {
        requiredRoles = ['admin', 'manager', 'editor', 'section_editor'] // Default API roles
        break
      }
    }
  }

  // If route is not protected, allow access
  if (!requiredRoles) {
    return NextResponse.next()
  }

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

    // Get user roles from our custom session
    const sessionCookie = request.cookies.get('session-token')
    let userRoles: string[] = []
    
    if (sessionCookie) {
      try {
        // Try to get user data from our custom session endpoint
        const sessionResponse = await fetch(new URL('/api/auth/session', request.url), {
          headers: {
            'Cookie': `session-token=${sessionCookie.value}`
          }
        })
        
        if (sessionResponse.ok) {
          const userData = await sessionResponse.json()
          userRoles = userData.user?.roles?.map((role: any) => role.role_path) || []
        }
      } catch (error) {
        console.error('Error getting user roles from session:', error)
      }
    }

    // If no roles from custom session, try to get from Supabase user metadata
    if (userRoles.length === 0 && session.user.user_metadata?.roles) {
      userRoles = session.user.user_metadata.roles.map((role: any) => role.role_path)
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
    
    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to unauthorized
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login and unauthorized pages
     */
    '/((?!_next/static|_next/image|favicon.ico|public|login|unauthorized).*)',
  ],
}