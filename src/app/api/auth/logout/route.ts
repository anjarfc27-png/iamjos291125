import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { data: { session }, error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ message: 'Logged out successfully' })

    // Clear cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}