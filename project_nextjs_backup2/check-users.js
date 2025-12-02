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
} catch (error) {
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
  } catch (err) {}
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function checkUsers() {
  console.log('=== CHECKING ALL USERS ===\n')
  
  // Get all users
  const { data: users, error } = await supabase
    .from('user_accounts')
    .select('id, username, email, first_name, last_name')
    .order('username')
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log(`Found ${users.length} users:\n`)
  users.forEach((user, idx) => {
    console.log(`${idx + 1}. ${user.username} (${user.email})`)
    console.log(`   Name: ${user.first_name} ${user.last_name}`)
    console.log(`   ID: ${user.id}`)
    console.log('')
  })
  
  // Check for admin
  const adminUsers = users.filter(u => 
    u.username.toLowerCase().includes('admin') || 
    u.email.toLowerCase().includes('admin')
  )
  
  if (adminUsers.length > 0) {
    console.log('Admin users found:')
    adminUsers.forEach(u => console.log(`  - ${u.username} (${u.email})`))
  } else {
    console.log('⚠ No admin users found!')
  }
}

checkUsers().catch(console.error)








