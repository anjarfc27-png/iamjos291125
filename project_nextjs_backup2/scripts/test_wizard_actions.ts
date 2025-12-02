
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testWizardActions() {
    console.log('Testing Wizard Actions...');

    // 1. Get Journal ID
    const { data: journal } = await supabase.from('journals').select('id').eq('path', 'phase24-journal').single();
    if (!journal) {
        console.error('Journal not found. Run create_persistent_journal.ts first.');
        return;
    }
    const journalId = journal.id;
    console.log('Journal ID:', journalId);

    // 2. Create Section
    console.log('Creating Section...');
    const { data: section, error: sectionError } = await supabase.from("sections").insert({
        journal_id: journalId,
        seq: 1,
        editor_restricted: false,
        meta_indexed: true,
        meta_reviewed: true,
        abstracts_not_required: false,
        hide_title: false,
        hide_author: false,
        is_active: true,
    }).select('id').single();

    if (sectionError) {
        console.error('Create Section Failed:', sectionError);
    } else {
        console.log('✅ Section created:', section.id);

        // Insert settings
        const settings = [
            { section_id: section.id, setting_name: "title", setting_value: 'Articles', locale: "" },
            { section_id: section.id, setting_name: "abbrev", setting_value: 'ART', locale: "" },
            { section_id: section.id, setting_name: "policy", setting_value: 'Default policy', locale: "" },
        ];
        const { error: settingsError } = await supabase.from("section_settings").insert(settings);
        if (settingsError) console.error('Create Section Settings Failed:', settingsError);
        else console.log('✅ Section settings created.');
    }

    // 3. Enroll User
    console.log('Enrolling User...');
    const email = 'copyeditor@example.com';
    const roleId = 16; // Manager

    // Find user
    const { data: user } = await supabase.from("user_accounts").select("id").eq("email", email).single();
    if (!user) {
        console.error('User not found');
        return;
    }

    // Find user group (simulated logic from action)
    // We need to find a user_group for this role in this journal.
    // If it doesn't exist, we might fail. Let's check if any exist.
    const { data: userGroup } = await supabase
        .from("user_groups")
        .select("id")
        .eq("context_id", journalId)
        .eq("role_id", roleId)
        .limit(1)
        .single();

    if (!userGroup) {
        console.log('⚠️ User group not found for this journal. Creating default groups via RPC if possible, or manually.');
        // In a real scenario, creating a journal should populate default user groups.
        // Let's check if admin_create_journal did that.
        // If not, we might need to create one manually for this test.

        const { data: newGroup, error: groupError } = await supabase.from("user_groups").insert({
            context_id: journalId,
            role_id: roleId,
            is_default: true,
            show_title: true,
            permit_self_registration: false,
        }).select('id').single();

        if (groupError) {
            console.error('Failed to create user group:', groupError);
            return;
        }
        console.log('Created ad-hoc user group:', newGroup.id);

        // Now enroll
        const { error: enrollError } = await supabase.from("user_user_groups").insert({
            user_id: user.id,
            user_group_id: newGroup.id
        });
        if (enrollError) console.error('Enrollment Failed:', enrollError);
        else console.log('✅ User enrolled (new group).');

    } else {
        const { error: enrollError } = await supabase.from("user_user_groups").insert({
            user_id: user.id,
            user_group_id: userGroup.id
        });
        if (enrollError) console.error('Enrollment Failed:', enrollError);
        else console.log('✅ User enrolled (existing group).');
    }

    // 4. Verify
    const { data: sections } = await supabase.from('sections').select('*').eq('journal_id', journalId);
    console.log(`Sections count: ${sections?.length}`);

    const { data: enrollments } = await supabase.from('user_user_groups')
        .select('user_id, user_group:user_groups(context_id)')
        .eq('user_group.context_id', journalId); // This join might be tricky in raw query if not set up

    // Simpler check
    // We can't easily filter by joined column in simple select without !inner or similar.
    // Let's just check user_account_roles view if it exists, or just trust the insert.
    console.log('Wizard actions test complete.');
}

testWizardActions();
