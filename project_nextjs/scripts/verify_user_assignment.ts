import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUserAssignmentLogic() {
    console.log('🧪 Verifying User Assignment Logic (Atomic Split-Brain Prevention)...\n');

    const testPath = `assign-test-${Date.now()}`;
    let journalId = '';
    let userId = '';

    try {
        // 1. Setup Data
        console.log('1. Setting up Test Data...');

        // Create Journal
        const { data: newJournalId, error: createError } = await supabase.rpc('admin_create_journal', {
            p_path: testPath,
            p_enabled: true,
            p_settings: [{ setting_name: 'name', setting_value: 'Assignment Test Journal' }]
        });
        if (createError) throw new Error(`Journal create failed: ${createError.message}`);
        journalId = newJournalId;

        // Create User (Dummy)
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            email_confirm: true
        });
        if (userError) throw new Error(`User create failed: ${userError.message}`);
        userId = user.user.id;

        // Insert into public.users (needed for FKs)
        await supabase.from('users').insert({
            id: userId,
            username: `testuser${Date.now()}`,
            email: user.user.email,
            password: 'hashedpassword',
            first_name: 'Test',
            last_name: 'User'
        });

        // Simulate ensureUserAccount (Required by FK)
        await supabase.from('user_accounts').insert({
            id: userId,
            username: `testuser${Date.now()}`,
            email: user.user.email,
            password: 'password123',
            first_name: 'Test',
            last_name: 'User'
        });

        console.log(`   ✅ Created Journal: ${journalId}`);
        console.log(`   ✅ Created User: ${userId}`);

        // 2. Simulate "addJournalUserRole" (Corrected Logic)
        console.log('\n2. Simulating addJournalUserRole (Manager)...');
        const role = 'manager';

        // A. Legacy Insert (Using context_id and role_name)
        const { error: legacyInsertError } = await supabase.from("user_account_roles").insert({
            context_id: journalId,
            user_id: userId,
            role_name: role,
        });

        if (legacyInsertError) {
            console.error('   ❌ Legacy Insert Failed:', legacyInsertError.message);
            throw legacyInsertError;
        } else {
            console.log('   ✅ Legacy Insert Success');
        }

        // B. OJS Sync Logic
        let roleId = 16; // Manager

        // Find/Create Group
        let { data: groupData } = await supabase
            .from("user_groups")
            .select("id")
            .eq("context_id", journalId)
            .eq("role_id", roleId)
            .single();

        if (!groupData) {
            const { data: newGroup } = await supabase
                .from("user_groups")
                .insert({
                    context_id: journalId,
                    role_id: roleId,
                    is_default: true,
                    show_title: true
                })
                .select("id")
                .single();
            groupData = newGroup;
        }

        // Assign
        await supabase.from("user_user_groups").insert({
            user_id: userId,
            user_group_id: groupData!.id
        });

        console.log('   ✅ Executed assignment logic.');

        // 3. Verify Consistency
        console.log('\n3. Verifying Consistency...');

        const { data: legacy } = await supabase.from('user_account_roles').select('*').eq('user_id', userId).eq('context_id', journalId);
        const { data: ojs } = await supabase.from('user_user_groups').select('*, user_groups(*)').eq('user_id', userId);

        console.log(`   Legacy Roles: ${legacy?.length}`);
        console.log(`   OJS Roles: ${ojs?.length}`);

        if (legacy?.length === 1 && ojs?.length === 1) {
            console.log('   ✅ SUCCESS: Role exists in BOTH tables.');
        } else {
            console.log('   ❌ FAIL: Role count mismatch.');
        }

        // 4. Simulate "removeJournalUserRole"
        console.log('\n4. Simulating removeJournalUserRole...');

        // A. Legacy Delete
        await supabase.from("user_account_roles").delete().eq('user_id', userId).eq('context_id', journalId);

        // B. OJS Delete Logic
        const { data: groups } = await supabase.from("user_groups").select("id").eq("context_id", journalId).eq("role_id", roleId);
        if (groups) {
            const ids = groups.map(g => g.id);
            await supabase.from("user_user_groups").delete().eq("user_id", userId).in("user_group_id", ids);
        }

        console.log('   ✅ Executed removal logic.');

        // 5. Verify Removal
        const { data: legacy2 } = await supabase.from('user_account_roles').select('*').eq('user_id', userId).eq('context_id', journalId);
        const { data: ojs2 } = await supabase.from('user_user_groups').select('*').eq('user_id', userId);

        if (legacy2?.length === 0 && ojs2?.length === 0) {
            console.log('   ✅ SUCCESS: Role removed from BOTH tables.');
        } else {
            console.log('   ❌ FAIL: Roles still exist.');
        }

    } catch (err: any) {
        console.error('\n❌ Error:', err.message);
    } finally {
        // Cleanup
        if (journalId) {
            console.log('\n🧹 Cleaning up Journal...');
            const { error } = await supabase.from('journals').delete().eq('id', journalId);
            if (error) console.error('   Failed to delete journal:', error.message);
        }
        if (userId) {
            console.log('🧹 Cleaning up User...');
            const { error } = await supabase.auth.admin.deleteUser(userId);
            if (error) console.error('   Failed to delete auth user:', error.message);

            // Also ensure public user is gone
            await supabase.from('users').delete().eq('id', userId);
            await supabase.from('user_accounts').delete().eq('id', userId);
        }
    }
}

verifyUserAssignmentLogic();
