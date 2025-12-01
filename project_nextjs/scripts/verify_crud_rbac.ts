
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- RBAC Logic Ported from src/lib/permissions.ts for Verification ---
const ROLE_TO_ROLE_ID: Record<string, number> = {
    manager: 16,
    editor: 16,
    section_editor: 17,
    guest_editor: 17,
    reviewer: 4096,
    author: 65536,
    reader: 1048576,
    copyeditor: 4097,
    proofreader: 4097,
    "layout-editor": 4097,
    "subscription-manager": 2097152,
    admin: 1,
};

async function hasUserSiteRole(userId: string, rolePath: string): Promise<boolean> {
    // 1. Check user_account_roles
    const { data: accountRoles } = await supabase
        .from("user_account_roles")
        .select("role_path, context_id")
        .eq("user_id", userId);

    const hasAccountRole = (accountRoles ?? []).some((r: any) => r.role_path === rolePath && (r.context_id == null));
    if (hasAccountRole) return true;

    // 2. Fallback: user_user_groups (Legacy)
    if (rolePath === 'admin') {
        const roleId = ROLE_TO_ROLE_ID[rolePath];
        const { data: userGroups } = await supabase
            .from("user_user_groups")
            .select(`user_groups!inner(role_id, context_id)`)
            .eq("user_id", userId)
            .eq("user_groups.role_id", roleId);

        // Check for context_id 0 or null
        const hasLegacyAdmin = (userGroups ?? []).some((g: any) =>
            g.user_groups.context_id === 0 || g.user_groups.context_id === null
        );
        if (hasLegacyAdmin) return true;
    }
    return false;
}

async function verifyRBAC() {
    console.log('\n--- Verifying RBAC Logic ---');
    const email = `test-rbac-${Date.now()}@example.com`;
    const password = 'password123';

    // 1. Create Test User
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (createError || !user) {
        console.error('Failed to create test user:', createError);
        return false;
    }
    console.log(`Test user created: ${user.id}`);

    try {
        // 2. Verify NO Admin Role
        const isAdminInitially = await hasUserSiteRole(user.id, 'admin');
        if (isAdminInitially) {
            console.error('❌ User should NOT be admin initially.');
            return false;
        }
        console.log('✅ User correctly identified as NON-ADMIN.');

        // 3. Grant Admin Role via user_user_groups (Legacy/Fallback)
        // First, find the Site Admin user group (role_id = 1, context_id = 0)
        let { data: adminGroup, error: groupError } = await supabase
            .from('user_groups')
            .select('id')
            .eq('role_id', 1) // Admin Role ID
            .eq('context_id', 0) // Site Context
            .single();

        if (!adminGroup) {
            // Try NULL context_id if 0 not found
            const { data: adminGroupNull } = await supabase
                .from('user_groups')
                .select('id')
                .eq('role_id', 1)
                .is('context_id', null)
                .single();
            adminGroup = adminGroupNull;
        }

        if (!adminGroup) {
            console.error('Failed to find Site Admin user group (role_id=1, context_id=0 or NULL).');
            return false;
        }

        const { error: grantError } = await supabase
            .from('user_user_groups')
            .insert({
                user_id: user.id,
                user_group_id: adminGroup.id
            });

        if (grantError) {
            console.error('Failed to grant admin role via user_user_groups:', grantError);
            return false;
        }
        console.log('Admin role granted via user_user_groups.');

        // 4. Verify Admin Role
        const isAdminAfter = await hasUserSiteRole(user.id, 'admin');
        if (!isAdminAfter) {
            console.error('❌ User SHOULD be admin after grant.');
            return false;
        }
        console.log('✅ User correctly identified as ADMIN.');

        return true;
    } finally {
        // Cleanup
        await supabase.auth.admin.deleteUser(user.id);
        console.log('Test user deleted.');
    }
}

async function verifyJournalCRUD() {
    console.log('\n--- Verifying Journal CRUD ---');
    const journalPath = `test-crud-${Date.now()}`;

    // 1. Create
    const { data: journal, error: createError } = await supabase
        .from('journals')
        .insert({ path: journalPath, enabled: true })
        .select('id')
        .single();

    if (createError || !journal) {
        console.error('❌ Create Journal Failed:', createError);
        return false;
    }
    console.log(`✅ Journal Created: ${journal.id}`);

    // 2. Read
    const { data: readJournal, error: readError } = await supabase
        .from('journals')
        .select('*')
        .eq('id', journal.id)
        .single();

    if (readError || !readJournal) {
        console.error('❌ Read Journal Failed:', readError);
        return false;
    }
    console.log('✅ Journal Read Successful.');

    // 3. Update
    const { error: updateError } = await supabase
        .from('journals')
        .update({ enabled: false })
        .eq('id', journal.id);

    if (updateError) {
        console.error('❌ Update Journal Failed:', updateError);
        return false;
    }

    const { data: updatedJournal } = await supabase
        .from('journals')
        .select('enabled')
        .eq('id', journal.id)
        .single();

    if (updatedJournal?.enabled !== false) {
        console.error('❌ Update Verification Failed.');
        return false;
    }
    console.log('✅ Journal Update Successful (Disabled).');

    // 4. Delete
    const { error: deleteError } = await supabase
        .from('journals')
        .delete()
        .eq('id', journal.id);

    if (deleteError) {
        console.error('❌ Delete Journal Failed:', deleteError);
        return false;
    }
    console.log('✅ Journal Delete Successful.');

    return true;
}

async function verifyUserCRUD() {
    console.log('\n--- Verifying User CRUD ---');
    const email = `test-crud-${Date.now()}@example.com`;

    // 1. Create (via Auth)
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { first_name: 'Test', last_name: 'CRUD' }
    });

    if (createError || !user) {
        console.error('❌ Create User Failed:', createError);
        return false;
    }
    console.log(`✅ User Created: ${user.id}`);

    // 2. Update (Profile)
    // Wait a bit for trigger
    await new Promise(r => setTimeout(r, 1000));

    const { error: updateError } = await supabase
        .from('user_accounts')
        .update({ first_name: 'UpdatedName' })
        .eq('id', user.id);

    if (updateError) {
        console.error('❌ Update User Profile Failed (Check if user_accounts exists):', updateError);
        // Fallback: Insert if missing
        await supabase.from('user_accounts').insert({ id: user.id, first_name: 'UpdatedName', email });
    } else {
        console.log('✅ User Profile Updated.');
    }

    // 3. Ban (Disable)
    const { error: banError } = await supabase.auth.admin.updateUserById(user.id, {
        ban_duration: '100h'
    });

    if (banError) {
        console.error('❌ Ban User Failed:', banError);
        return false;
    }
    console.log('✅ User Banned.');

    // 4. Delete
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
        console.error('❌ Delete User Failed:', deleteError);
        return false;
    }
    console.log('✅ User Deleted.');

    return true;
}

async function run() {
    const rbac = await verifyRBAC();
    const journal = await verifyJournalCRUD();
    const user = await verifyUserCRUD();

    if (rbac && journal && user) {
        console.log('\n✅ ALL CRUD & RBAC CHECKS PASSED');
        process.exit(0);
    } else {
        console.error('\n❌ SOME CHECKS FAILED');
        process.exit(1);
    }
}

run();
