
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncUsers() {
    console.log('Starting User Sync (handling email conflicts)...');

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    console.log(`Found ${users.length} users in Auth.`);

    for (const user of users) {
        // Check if ID exists
        const { data: existingId } = await supabase
            .from('user_accounts')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!existingId) {
            console.log(`Syncing user: ${user.email} (${user.id})`);

            let username = user.user_metadata?.username || user.email.split('@')[0];
            const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.first_name || 'Admin';
            const lastName = user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.last_name || 'User';

            // Check for email conflict (stale record)
            const { data: emailConflict } = await supabase
                .from('user_accounts')
                .select('id')
                .eq('email', user.email)
                .single();

            if (emailConflict) {
                console.log(`Email conflict for ${user.email}. Deleting stale record ${emailConflict.id}...`);
                // Try to delete the stale record
                const { error: deleteError } = await supabase
                    .from('user_accounts')
                    .delete()
                    .eq('id', emailConflict.id);

                if (deleteError) {
                    console.error(`Failed to delete stale record: ${deleteError.message}. Skipping sync for this user.`);
                    continue; // Skip insert if delete failed (likely FK constraint)
                }
                console.log('Stale record deleted.');
            }

            // Check for username conflict
            const { data: usernameConflict } = await supabase
                .from('user_accounts')
                .select('id, username')
                .eq('username', username)
                .single();

            if (usernameConflict) {
                console.log(`Username conflict for ${username}. Appending random suffix.`);
                username = `${username}_${Math.floor(Math.random() * 1000)}`;
            }

            const { error: insertError } = await supabase
                .from('user_accounts')
                .insert({
                    id: user.id,
                    username: username,
                    email: user.email,
                    first_name: firstName,
                    last_name: lastName,
                    password: 'hashed_placeholder',
                    created_at: user.created_at,
                    updated_at: user.updated_at
                });

            if (insertError) {
                console.error(`Failed to insert ${user.email}:`, insertError.message);
            } else {
                console.log(`Successfully synced ${user.email}`);
            }
        }
    }

    console.log('Sync complete.');
}

syncUsers();
