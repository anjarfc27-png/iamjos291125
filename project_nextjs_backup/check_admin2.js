
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin2() {
    console.log('Checking admin2@ojs.test...');
    const { data: user, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email', 'admin2@ojs.test')
        .single();

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Found admin2:', user.id);
        if (user.id === 'd769b460-ad65-4b43-9344-ed2fdc486d5a') {
            console.log('MATCH! The ghost ID belongs to admin2!');
        } else {
            console.log('No match with ghost ID.');
        }
    }
}

checkAdmin2();
