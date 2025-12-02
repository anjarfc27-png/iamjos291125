import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tzfdfjysombezodipwjt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6ZmRmanlzb21iZXpvZGlwd2p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk2MzA4NCwiZXhwIjoyMDc4NTM5MDg0fQ.vA-fKNJ3aaS2_Ee7LvQT6gipq2z0d0Z9wYBnAH0hLO0'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  // Test 1: Simple query to see if we can connect
  const { data: testData, error: testError } = await supabase
    .from('journals')
    .select('*')
    .limit(1)
  
  console.log('Journals test:', { testData, testError })
  
  // Test 2: Try to query users table
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    console.log('Users test:', { usersData, usersError })
  } catch (error) {
    console.error('Users table error:', error)
  }
  
  // Test 3: Try raw SQL
  try {
    const { data: rawData, error: rawError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT * FROM users LIMIT 1' })
    
    console.log('Raw SQL test:', { rawData, rawError })
  } catch (error) {
    console.error('Raw SQL error:', error)
  }
}

testConnection()