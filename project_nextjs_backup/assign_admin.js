
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function assignAdmin() {
    const email = 'admin@ojs.test';
    console.log(`Assigning admin role to ${email}...`);

    // 1. Get User ID
    const { data: user, error: userError } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', email)
        .single();

    if (userError || !user) {
        console.error('User not found:', userError?.message);
        return;
    }

    // 2. Insert Role (Correct Columns)
    const { error: insertError } = await supabase
        .from('user_account_roles')
        .insert({
            user_id: user.id,
            role_name: 'Site admin',
            role_path: 'admin'
        });

    if (insertError) {
        console.error('Failed to assign role:', insertError.message);
    } else {
        console.log('Successfully assigned Admin role!');
    }
}

assignAdmin();
