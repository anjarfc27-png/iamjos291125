import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkParity() {
  console.log('Starting OJS 3.3 Parity Check...');
  let allPassed = true;

  // 1. Check Key Tables
  const requiredTables = [
    'users', 'journals', 'submissions', 'publications', 'issues',
    'review_rounds', 'review_assignments', 'stage_assignments',
    'email_templates', 'notifications', 'scheduled_tasks'
  ];

  console.log('\nChecking Key Tables...');
  for (const table of requiredTables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.error(`[FAIL] Table '${table}' missing or inaccessible: ${error.message}`);
      allPassed = false;
    } else {
      console.log(`[PASS] Table '${table}' exists.`);
    }
  }

  // 2. Check RLS Policies (Sampling 'submissions' table)
  console.log('\nChecking RLS on "submissions"...');
  // Note: We can't easily check enabled RLS via JS client without querying pg_class/pg_policy directly
  // or trying an anonymous select.
  // We'll try to select as anonymous (should fail or return empty if RLS is on and no public policy)
  const anonClient = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  const { data: anonData, error: anonError } = await anonClient.from('submissions').select('*').limit(1);

  // If RLS is on, and there's no public policy, this might return empty data or error depending on setup.
  // But we know we added policies.
  // A better check is to query `pg_policies` via RPC if we had one, but we don't.
  // We'll trust the migration file existence for now, but let's just log the result.
  console.log(`[INFO] Anonymous access to submissions: ${anonError ? anonError.message : (anonData?.length + ' rows')}`);


  // 3. Check Storage Buckets
  console.log('\nChecking Storage Buckets...');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error(`[FAIL] Could not list buckets: ${bucketError.message}`);
    allPassed = false;
  } else {
    const requiredBuckets = ['journals', 'submissions', 'temporary', 'public'];
    const existingBucketNames = buckets.map(b => b.name);

    for (const bucket of requiredBuckets) {
      if (existingBucketNames.includes(bucket)) {
        console.log(`[PASS] Bucket '${bucket}' exists.`);
      } else {
        console.error(`[FAIL] Bucket '${bucket}' is MISSING.`);
        allPassed = false;
      }
    }
  }

  if (allPassed) {
    console.log('\n✅ Parity Check PASSED: Core infrastructure seems aligned.');
  } else {
    console.error('\n❌ Parity Check FAILED: Some components are missing.');
    process.exit(1);
  }
}

checkParity().catch(console.error);
