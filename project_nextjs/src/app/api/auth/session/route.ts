import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    // Try our custom auth first
    const user = await getCurrentUser(request)
    
    if (user) {
      return NextResponse.json({ user })
    }

    // If custom auth fails, try Supabase session
    try {
      const supabase = await createSupabaseServerClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Create user object from Supabase session
        const supabaseUser = {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || undefined,
          roles: session.user.user_metadata?.roles || []
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