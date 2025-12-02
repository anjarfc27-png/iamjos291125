
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateUsers() {
    console.log('Investigating Users Tables...');

    const { count: usersCount, error: err1 } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: accountsCount, error: err2 } = await supabase.from('user_accounts').select('*', { count: 'exact', head: true });

    console.log(`'users' table count: ${usersCount} (Error: ${err1?.message})`);
    console.log(`'user_accounts' table count: ${accountsCount} (Error: ${err2?.message})`);

    // Check foreign keys (heuristic: check if authors references users or user_accounts)
    // We can't easily check FK constraints via JS client without admin RPC, but we can check data.

    // Let's check if we can insert into 'users' or if it fails due to missing cols
    const { data: usersSample } = await supabase.from('users').select('*').limit(1);
    const { data: accountsSample } = await supabase.from('user_accounts').select('*').limit(1);

    console.log('Sample from users:', usersSample);
    console.log('Sample from user_accounts:', accountsSample);
}

investigateUsers();
