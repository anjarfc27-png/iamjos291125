
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateGhost() {
    const ghostId = 'd769b460-ad65-4b43-9344-ed2fdc486d5a';
    console.log(`Investigating ghost ID: ${ghostId}...`);

    const { data: user, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('id', ghostId)
        .single();

    if (error) {
        console.log('Error fetching ghost:', error.message);
    } else {
        console.log('Ghost User Found:');
        console.log(JSON.stringify(user, null, 2));
        console.log(`Email length: ${user.email.length}`);
        console.log(`Email chars: ${user.email.split('').map(c => c.charCodeAt(0)).join(',')}`);
    }
}

investigateGhost();
