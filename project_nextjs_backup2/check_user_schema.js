
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserSchema() {
    console.log('Checking user_accounts columns...');
    // We can't list columns directly via JS client easily without a row or RPC.
    // Let's fetch one row and see keys.
    const { data: user } = await supabase.from('user_accounts').select('*').limit(1);
    if (user && user.length > 0) {
        console.log('user_accounts keys:', Object.keys(user[0]));
    }

    console.log('\nChecking user_settings table...');
    const { data: settings, error } = await supabase.from('user_settings').select('*').limit(5);
    if (error) {
        console.log('user_settings error:', error.message);
    } else {
        console.log('user_settings sample:', settings);
    }
}

checkUserSchema();
