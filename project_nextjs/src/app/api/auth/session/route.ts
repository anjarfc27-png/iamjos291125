import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getUserById, getUserRoles } from '@/lib/db'
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: Promise<{}> }) {
  try {
    // Try our custom auth first (uses session-token cookie)
    const user = await getCurrentUser(request as any)

    if (user) {
      return NextResponse.json({ user })
    }

    // If custom auth fails, try Supabase session
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Important: Supabase Auth user.id might differ from user_accounts.id
        // So we need to get the correct user_id from database using email or metadata
        let dbUserId = session.user.user_metadata?.user_id

        // If not in metadata, find user by email from database
        if (!dbUserId) {
          const { getUserByEmail } = await import('@/lib/db')
          const userDataByEmail = await getUserByEmail(session.user.email || '')
          dbUserId = userDataByEmail?.user_id
        }

        // If still no user_id, use Supabase Auth user.id as fallback
        if (!dbUserId) {
          dbUserId = session.user.id
        }

        // Get user data from database using the correct user_id
        const userData = await getUserById(dbUserId)
        if (!userData) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        // Get user roles from database using the correct user_id
        const roles = await getUserRoles(dbUserId)

        // Create user object with roles from database
        const supabaseUser = {
          id: userData.user_id,
          username: userData.username,
          email: userData.email,
          full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
          roles: roles
        }

        return NextResponse.json({ user: supabaseUser })
      }
    } catch (supabaseError) {
      console.error('Supabase session error:', supabaseError)
    }

    // No valid session found
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status: 500 }
    );
  }
}