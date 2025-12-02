
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicates() {
    const email = 'admin@ojs.test';
    const authId = 'cff38119-7986-47d5-9d76-b9862848a8ad'; // From logs/previous steps

    console.log(`Checking duplicates for ${email}...`);

    // 1. Get ALL users with this email
    const { data: users, error } = await supabase
        .from('user_accounts')
        .select('id, username, email, created_at')
        .eq('email', email);

    if (error) {
        console.error('Error fetching users:', error.message);
        return;
    }

    console.log(`Found ${users.length} records:`);
    users.forEach(u => {
        const isAuth = u.id === authId;
        console.log(` - ID: ${u.id} | Username: ${u.username} | Created: ${u.created_at} ${isAuth ? '[MATCHES AUTH]' : '[STALE]'}`);
    });

    if (users.length > 1) {
        console.log('\nResolving duplicates...');
        for (const user of users) {
            if (user.id !== authId) {
                console.log(`Deleting stale user ${user.id}...`);

                // Delete roles first (cascade might handle this, but being safe)
                await supabase.from('user_account_roles').delete().eq('user_id', user.id);

                // Delete user
                const { error: delError } = await supabase.from('user_accounts').delete().eq('id', user.id);

                if (delError) {
                    console.error(`Failed to delete ${user.id}:`, delError.message);
                } else {
                    console.log(`Successfully deleted ${user.id}`);
                }
            }
        }
        console.log('Duplicates resolved.');
    } else {
        console.log('No duplicates found. Strange...');
    }
}

fixDuplicates();
