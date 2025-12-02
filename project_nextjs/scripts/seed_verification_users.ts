
import { createClient } from '@supabase/supabase-js';

// Set env vars
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcjyjmaaiutnnadwftz.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const USERS = [
    { email: 'verify_admin@example.com', password: 'password123', role: 'admin', first_name: 'Verify', last_name: 'Admin' },
    { email: 'verify_manager@example.com', password: 'password123', role: 'manager', first_name: 'Verify', last_name: 'Manager' },
    { email: 'verify_editor@example.com', password: 'password123', role: 'editor', first_name: 'Verify', last_name: 'Editor' },
    { email: 'verify_author@example.com', password: 'password123', role: 'author', first_name: 'Verify', last_name: 'Author' },
    { email: 'verify_reviewer@example.com', password: 'password123', role: 'reviewer', first_name: 'Verify', last_name: 'Reviewer' },
];

async function seedVerificationUsers() {
    console.log('🌱 Seeding Verification Users...');

    for (const u of USERS) {
        console.log(`Processing ${u.email}...`);

        // 1. Create Auth User (or get existing)
        let userId;
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users.find(user => user.email === u.email);

        if (existingUser) {
            console.log(`  - User exists: ${existingUser.id}`);
            userId = existingUser.id;
            // Update password just in case
            await supabase.auth.admin.updateUserById(userId, { password: u.password });
        } else {
            const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: {
                    first_name: u.first_name,
                    last_name: u.last_name
                }
            });
            if (createError) {
                console.error(`  - Failed to create auth user: ${createError.message}`);
                continue;
            }
            userId = newUser.user.id;
            console.log(`  - Created Auth User: ${userId}`);
        }

        // 2. Upsert into user_accounts
        const { error: accountError } = await supabase.from('user_accounts').upsert({
            id: userId,
            email: u.email,
            username: u.email.split('@')[0],
            first_name: u.first_name,
            last_name: u.last_name,
            password: u.password // Storing plaintext for legacy compat, though not ideal
        });

        if (accountError) {
            console.error(`  - Failed to upsert user_accounts: ${accountError.message}`);
        } else {
            console.log(`  - Upserted user_accounts`);
        }

        // 3. Upsert into user_account_roles
        // First delete existing roles to be clean
        await supabase.from('user_account_roles').delete().eq('user_id', userId);

        const { error: roleError } = await supabase.from('user_account_roles').insert({
            user_id: userId,
            role_name: u.role
        });

        if (roleError) {
            console.error(`  - Failed to insert role: ${roleError.message}`);
        } else {
            console.log(`  - Assigned role: ${u.role}`);
        }
    }

    console.log('✅ Seeding Complete.');
}

seedVerificationUsers();
