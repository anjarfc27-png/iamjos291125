import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditSchema() {
    console.log('Auditing Database Schema...\n');

    // 1. Check Submissions Table Columns
    console.log('--- Checking "submissions" table columns ---');
    // Note: We can't query information_schema directly via JS client usually, 
    // but we can try to select * from submissions limit 0 and check the returned structure if possible,
    // or use RPC if we had one. 
    // Since we don't have a generic SQL runner, we will try to insert a dummy row with ALL expected columns 
    // and see which one fails, OR better: try to select specific columns and catch errors.

    const expectedColumns = [
        'id', 'context_id', 'current_publication_id', 'date_submitted', 'date_status_modified', 'last_modified',
        'status', 'submission_progress', 'submitter_id', 'locale', 'stage_id'
    ];

    for (const col of expectedColumns) {
        const { error } = await supabase.from('submissions').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' MISSING or Inaccessible: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' exists`);
        }
    }

    // 2. Check Journals Table
    console.log('\n--- Checking "journals" table columns ---');
    const expectedJournalCols = ['id', 'path', 'enabled', 'primary_locale'];
    for (const col of expectedJournalCols) {
        const { error } = await supabase.from('journals').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' MISSING or Inaccessible: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' exists`);
        }
    }

    // 3. Check Users Table
    console.log('\n--- Checking "users" table columns ---');
    const expectedUserCols = ['id', 'username', 'email', 'password', 'given_name', 'family_name'];
    for (const col of expectedUserCols) {
        const { error } = await supabase.from('users').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' MISSING or Inaccessible: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' exists`);
        }
    }

    // 4. Check user_account_roles Table
    console.log('\n--- Checking "user_account_roles" table columns ---');
    const expectedRoleCols = ['user_id', 'role', 'journal_id'];
    for (const col of expectedRoleCols) {
        const { error } = await supabase.from('user_account_roles').select(col).limit(1);
        if (error) {
            console.log(`❌ Column '${col}' MISSING or Inaccessible: ${error.message}`);
        } else {
            console.log(`✅ Column '${col}' exists`);
        }
    }
}

auditSchema();
