import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    }
  })
  console.log('✓ Loaded .env.local')
} catch (error) {
  console.log('⚠ Could not load .env.local, trying env.local')
  try {
    const envContent = readFileSync(join(process.cwd(), 'env.local'), 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim()
          process.env[key.trim()] = value
        }
      }
    })
    console.log('✓ Loaded env.local')
  } catch (err) {
    console.error('❌ Could not load env files:', err.message)
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n=== SUPABASE CONNECTION TEST ===\n')
console.log('Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
console.log('Service Role Key:', supabaseServiceKey ? '✓ Set' : '✗ Missing')
console.log('Anon Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
console.log('')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function testConnection() {
  try {
    // Test 1: Check user_accounts table
    console.log('1. Testing user_accounts table...')
    const { data: usersData, error: usersError } = await supabase
      .from('user_accounts')
      .select('id, username, email')
      .limit(5)
    
    if (usersError) {
      console.error('   ❌ Error:', usersError.message)
    } else {
      console.log('   ✓ Success! Found', usersData?.length || 0, 'users')
      if (usersData && usersData.length > 0) {
        console.log('   Sample users:', usersData.map(u => ({ username: u.username, email: u.email })))
      }
    }

    // Test 2: Check user_account_roles table
    console.log('\n2. Testing user_account_roles table...')
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_account_roles')
      .select('user_id, role_name')
      .limit(5)
    
    if (rolesError) {
      console.error('   ❌ Error:', rolesError.message)
    } else {
      console.log('   ✓ Success! Found', rolesData?.length || 0, 'roles')
    }

    // Test 3: Try to query a specific user
    console.log('\n3. Testing query for admin user...')
    const { data: adminUser, error: adminError } = await supabase
      .from('user_accounts')
      .select('id, username, email, password')
      .eq('email', 'admin@example.com')
      .single()
    
    if (adminError) {
      console.error('   ❌ Error:', adminError.message)
    } else if (adminUser) {
      console.log('   ✓ Admin user found:', { 
        id: adminUser.id, 
        username: adminUser.username, 
        email: adminUser.email,
        hasPassword: !!adminUser.password 
      })
    } else {
      console.log('   ⚠ Admin user not found')
    }

    // Test 4: Test Supabase Auth connection
    console.log('\n4. Testing Supabase Auth...')
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      if (authError) {
        console.error('   ❌ Auth Error:', authError.message)
      } else {
        console.log('   ✓ Auth connected! Found', authUsers?.users?.length || 0, 'users in Auth')
      }
    } catch (authErr) {
      console.error('   ❌ Auth Exception:', authErr.message)
    }

    console.log('\n=== TEST COMPLETE ===\n')
    
  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testConnection().catch(console.error)

