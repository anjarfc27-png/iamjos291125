import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Create a Supabase client with service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Get user from user_accounts table (primary for login)
async function getUserFromAccounts(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_accounts')
      .select('id, username, email, password, first_name, last_name')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user from user_accounts:', error)
      return null
    }

    console.log('User data from user_accounts:', data)

    return data ? {
      user_id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password
    } : null
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('Exception in getUserFromAccounts:', message);
    return null
  }
}

// Get roles from user_account_roles table
async function getRolesFromAccountRoles(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_account_roles')
      .select('role_name')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching roles from user_account_roles:', error)
      return []
    }

    console.log('Roles from user_account_roles:', data)

    // Map to our expected format
    return data.map(role => ({
      user_group_id: role.role_name,
      user_group_name: role.role_name,
      context_id: null,
      journal_name: 'Site',
      role_path: getRolePath(role.role_name)
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('Exception in getRolesFromAccountRoles:', message);
    return []
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

export async function POST(request: NextRequest, { params }: { params: Promise<{}> }) {
  try {
    let email, password

    try {
      const body = await request.json()
      email = body.email
      password = body.password
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      )
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // 1. Try Supabase Auth FIRST (Source of Truth)
    const supabase = await createSupabaseServerClient()
    let authData = null
    let authError = null

    try {
      const signInResult = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })
      authData = signInResult.data
      authError = signInResult.error
    } catch (signInErr) {
      console.log('Supabase sign in attempt failed:', signInErr)
    }

    // If Supabase Auth succeeds, we are good!
    if (authData?.session) {
      console.log('Supabase Auth successful for:', email)

      // Sync/Get user data from user_accounts to return consistent response
      let userData = await getUserFromAccounts(email)

      if (!userData) {
        // If user exists in Auth but not in DB, we should probably create them or handle it.
        // For now, let's try to find them or return basic info.
        // But getRolesFromAccountRoles needs userId.
        // Let's assume sync_users.js ran, so they should be there.
        // If not, we might need to create a record.
        console.warn('User authenticated but not found in user_accounts:', email)
        // We can return the Auth user, but roles might be missing.
        // Let's try to fetch by ID from Auth data if email lookup failed?
        // But we need userData for roles.
      } else {
        // Update local password hash to match (optional, but good for fallback)
        // We can't get the hash from Supabase, so we can't sync it easily without knowing the plain text (which we have).
        // Let's update it if it's a placeholder.
        if (userData.password === 'hashed_placeholder') {
          try {
            const hashedPassword = await bcrypt.hash(password, 10)
            await supabaseAdmin
              .from('user_accounts')
              .update({ password: hashedPassword })
              .eq('id', userData.user_id)
            console.log('Updated placeholder password for user:', email)
          } catch (e) {
            console.error('Failed to update placeholder password', e)
          }
        }
      }

      // Construct response
      const userId = userData?.user_id || authData.user.id
      const roles = await getRolesFromAccountRoles(userId)
      const uniqueRoles = Array.from(
        new Map(
          roles.map(r => [
            `${r.user_group_id}|${r.journal_name || ''}|${r.context_id || ''}`,
            r
          ])
        ).values()
      )

      const user = {
        id: userId,
        username: userData?.username || authData.user.user_metadata?.username || email.split('@')[0],
        email: email,
        full_name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : undefined,
        roles: uniqueRoles
      }

      return NextResponse.json({ user })
    }

    // 2. If Supabase Auth fails, try Legacy/Local DB check
    console.log('Supabase Auth failed, trying local DB check...')

    const userData = await getUserFromAccounts(email)

    if (!userData) {
      console.error('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check local password
    let isPasswordValid = false
    if (userData.password.startsWith('$2a$') || userData.password.startsWith('$2b$') || userData.password.startsWith('$2y$')) {
      isPasswordValid = await bcrypt.compare(password, userData.password)
    } else {
      isPasswordValid = password === userData.password
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Local password valid! This is a legacy user not yet in Auth.
    // Migrate them to Supabase Auth.
    console.log('Local password valid, migrating to Supabase Auth...')

    try {
      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_id: userData.user_id
        }
      })

      if (createError) {
        console.error('Error migrating user to Supabase Auth:', createError)
        // Continue with custom session
      } else if (newAuthUser?.user) {
        // Sign in to get session
        const signInResult = await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password
        })
        if (signInResult.data.session) {
          // Success!
          // Update local password to hash if it was plain text
          if (!userData.password.startsWith('$2')) {
            const hashedPassword = await bcrypt.hash(password, 10)
            await supabaseAdmin.from('user_accounts').update({ password: hashedPassword }).eq('id', userData.user_id)
          }
        }
      }
    } catch (migrationError) {
      console.error('Migration error:', migrationError)
    }

    // Return success with custom session (or Auth session if migration worked)
    const roles = await getRolesFromAccountRoles(userData.user_id)
    const uniqueRoles = Array.from(
      new Map(
        roles.map(r => [
          `${r.user_group_id}|${r.journal_name || ''}|${r.context_id || ''}`,
          r
        ])
      ).values()
    )

    const user = {
      id: userData.user_id,
      username: userData.username,
      email: userData.email,
      full_name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || undefined,
      roles: uniqueRoles
    }

    const response = NextResponse.json({ user })

    // Set custom session cookie if needed (if Supabase session missing)
    // But ideally we want Supabase session.
    // If migration failed, we might need this.
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      response.cookies.set('custom-session', JSON.stringify({ userId: userData.user_id, email: userData.email }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return response

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
