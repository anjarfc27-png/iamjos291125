
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthGhost() {
    const ghostId = 'd769b460-ad65-4b43-9344-ed2fdc486d5a';
    console.log(`Checking if ${ghostId} exists in Auth...`);

    const { data: { user }, error } = await supabase.auth.admin.getUserById(ghostId);

    if (error) {
        console.log('Error:', error.message);
    } else if (user) {
        console.log('Found in Auth!');
        console.log('Email:', user.email);
        console.log('Metadata:', user.user_metadata);
    } else {
        console.log('Not found in Auth.');
    }
}

checkAuthGhost();
