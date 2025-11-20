import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const { data: { user: authUser, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !authUser || !session) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user data from OJS tables
    const { data: userData } = await supabase
      .from('users')
      .select('user_id, username, email, first_name, last_name')
      .eq('email', email)
      .single()

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found in system' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      user: {
        id: userData.user_id,
        username: userData.username,
        email: userData.email,
        full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      }
    })

    // Set cookies
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: session.expires_in,
      path: '/',
    })

    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}