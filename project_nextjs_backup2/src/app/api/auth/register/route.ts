import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, firstName, lastName, role = 'Reader' } = body

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in user_accounts table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('user_accounts')
      .insert({
        username,
        email,
        password: hashedPassword,
        first_name: firstName || null,
        last_name: lastName || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create Supabase Auth user
    try {
      const supabase = await createSupabaseServerClient()
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            first_name: firstName,
            last_name: lastName,
            user_id: userData.id
          }
        }
      })

      if (authError) {
        console.error('Supabase auth signup error:', authError)
        // Continue even if Supabase auth fails - we have the user in our DB
      }

    } catch (authError) {
      console.error('Auth creation error:', authError)
      // Continue - user exists in our DB
    }

    // Assign default role
    const { error: roleError } = await supabaseAdmin
      .from('user_account_roles')
      .insert({
        user_id: userData.id,
        role_name: role,
        created_at: new Date().toISOString()
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
      // Continue - user was created successfully
    }

    // Return success without password
    const { password: _, ...userWithoutPassword } = userData

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User created successfully'
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error('Registration error:', message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}