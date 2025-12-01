import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyJournalContext() {
    console.log("Starting Journal Context Verification...");

    const timestamp = Date.now();
    const journalAPath = `journal-a-${timestamp}`;
    const journalBPath = `journal-b-${timestamp}`;
    const userEmail = `test-manager-${timestamp}@example.com`;

    let journalAId: string | null = null;
    let journalBId: string | null = null;
    let userId: string | null = null;

    try {
        // 1. Create Journal A
        console.log("Creating Journal A...");
        const { data: jA, error: errA } = await supabase
            .from('journals')
            .insert({ path: journalAPath, enabled: true })
            .select()
            .single();

        if (errA) throw new Error(`Failed to create Journal A: ${errA.message}`);
        journalAId = jA.id;
        console.log(`Journal A created: ${journalAId}`);

        // Settings for A
        await supabase.from('journal_settings').insert({
            journal_id: journalAId,
            setting_name: "name",
            setting_value: "Journal A"
        });

        // 2. Create Journal B
        console.log("Creating Journal B...");
        const { data: jB, error: errB } = await supabase
            .from('journals')
            .insert({ path: journalBPath, enabled: true })
            .select()
            .single();

        if (errB) throw new Error(`Failed to create Journal B: ${errB.message}`);
        journalBId = jB.id;
        console.log(`Journal B created: ${journalBId}`);

        // Settings for B
        await supabase.from('journal_settings').insert({
            journal_id: journalBId,
            setting_name: "name",
            setting_value: "Journal B"
        });

        // 3. Create User
        console.log("Creating Test User...");
        const { data: userAuth, error: authError } = await supabase.auth.admin.createUser({
            email: userEmail,
            password: "password123",
            email_confirm: true
        });
        if (authError) throw new Error(`Failed to create user: ${authError.message}`);
        userId = userAuth.user.id;
        console.log(`User created: ${userId}`);

        // Manually sync to user_accounts to ensure FK satisfaction
        await supabase.from('user_accounts').insert({
            id: userId,
            email: userEmail,
            username: `user_${timestamp}`,
            password: 'hashed_password_placeholder'
        });

        // Manually sync to users (legacy OJS table) to ensure FK satisfaction for user_user_groups
        const { error: usersError } = await supabase.from('users').insert({
            id: userId,
            username: `user_${timestamp}`,
            email: userEmail,
            password: 'hashed_password_placeholder',
            first_name: "Test",
            last_name: "Manager",
            date_registered: new Date().toISOString(),
            date_last_login: new Date().toISOString(),
            must_change_password: false,
            disabled: false
        });

        if (usersError) {
            console.error("Failed to insert into users:", usersError);
            throw new Error(`Failed to insert into users: ${usersError.message}`);
        }

        // 4. Assign Manager Role to Journal A (using OJS User Groups logic)
        console.log("Assigning Manager role for Journal A...");

        // 4a. Create Manager User Group for Journal A
        const { data: groupA, error: groupError } = await supabase
            .from("user_groups")
            .insert({
                context_id: journalAId,
                role_id: 16, // Manager
                is_default: true,
                show_title: true,
                permit_self_registration: false,
                permit_metadata_edit: true
            })
            .select()
            .single();

        if (groupError) throw new Error(`Failed to create user group: ${groupError.message}`);
        const groupIdA = groupA.id;

        // 4b. Assign User to Group
        const { error: assignError } = await supabase
            .from("user_user_groups")
            .insert({
                user_group_id: groupIdA,
                user_id: userId
            });

        if (assignError) throw new Error(`Failed to assign user to group: ${assignError.message}`);

        // 5. Verify Permissions (Simulating hasUserJournalRole)
        console.log("Verifying Permissions...");

        // Check Journal A Access
        const { data: accessA } = await supabase
            .from("user_user_groups")
            .select(`
                user_groups!inner(
                    role_id,
                    context_id
                )
            `)
            .eq("user_id", userId)
            .eq("user_groups.context_id", journalAId)
            .eq("user_groups.role_id", 16); // Manager

        const hasAccessA = (accessA && accessA.length > 0);

        // Check Journal B Access
        const { data: accessB } = await supabase
            .from("user_user_groups")
            .select(`
                user_groups!inner(
                    role_id,
                    context_id
                )
            `)
            .eq("user_id", userId)
            .eq("user_groups.context_id", journalBId)
            .eq("user_groups.role_id", 16);

        const hasAccessB = (accessB && accessB.length > 0);

        console.log(`Access to Journal A (Expected: true): ${hasAccessA}`);
        console.log(`Access to Journal B (Expected: false): ${hasAccessB}`);

        if (hasAccessA && !hasAccessB) {
            console.log("✅ SUCCESS: Journal Context Isolation Verified.");
        } else {
            console.error("❌ FAILURE: Isolation check failed.");
            if (!hasAccessA) console.error(" - User should have access to Journal A but doesn't.");
            if (hasAccessB) console.error(" - User should NOT have access to Journal B but does.");
        }

    } catch (error: any) {
        console.error("❌ ERROR:", error.message);
    } finally {
        // Cleanup
        console.log("Cleaning up...");
        if (journalAId) await supabase.from("journals").delete().eq("id", journalAId);
        if (journalBId) await supabase.from("journals").delete().eq("id", journalBId);
        if (userId) await supabase.auth.admin.deleteUser(userId);
        console.log("Cleanup complete.");
    }
}

verifyJournalContext();
