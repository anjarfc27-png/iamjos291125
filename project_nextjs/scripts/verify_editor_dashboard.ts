
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyEditorDashboard() {
    console.log('Verifying Editor Dashboard Data Fetching...');

    try {
        // 1. Fetch Submissions (Unassigned)
        console.log('\n1. Fetching Unassigned Submissions...');

        // Simulate listSubmissions logic for 'unassigned'
        // First, get assigned IDs
        const { data: editorGroups } = await supabase
            .from("user_groups")
            .select("id")
            .in("role_id", [16, 32, 4096]); // Manager, Editor, Section Editor

        const editorGroupIds = editorGroups?.map(g => g.id) || [];
        console.log(`   Found ${editorGroupIds.length} editor user groups.`);

        let assignedIds: string[] = [];
        if (editorGroupIds.length > 0) {
            const { data: assignments } = await supabase
                .from("stage_assignments")
                .select("submission_id")
                .in("user_group_id", editorGroupIds);

            assignedIds = Array.from(new Set(assignments?.map(a => a.submission_id) || []));
        }
        console.log(`   Found ${assignedIds.length} assigned submissions.`);

        // Query submissions excluding assigned
        let query = supabase
            .from("submissions")
            .select("id, status, stage_id, date_submitted, context_id, current_publication_id")
            .not("status", "in", "(3,4)") // Not archived
            .order("last_modified", { ascending: false })
            .limit(10);

        if (assignedIds.length > 0) {
            query = query.not("id", "in", assignedIds);
        }

        const { data: unassignedSubs, error: unassignedError } = await query;

        if (unassignedError) throw new Error(`Unassigned fetch failed: ${unassignedError.message}`);

        console.log(`   ✅ Fetched ${unassignedSubs.length} unassigned submissions.`);
        if (unassignedSubs.length > 0) {
            console.log(`   Sample ID: ${unassignedSubs[0].id}, Stage: ${unassignedSubs[0].stage_id}`);
        }

        // 2. Fetch All Active Submissions
        console.log('\n2. Fetching All Active Submissions...');
        const { data: allSubs, error: allError } = await supabase
            .from("submissions")
            .select("id, status, stage_id")
            .not("status", "in", "(3,4)")
            .limit(10);

        if (allError) throw new Error(`All active fetch failed: ${allError.message}`);
        console.log(`   ✅ Fetched ${allSubs.length} active submissions.`);

        // 3. Verify Title Fetching
        if (allSubs.length > 0) {
            console.log('\n3. Verifying Title Fetching...');
            const sampleSub = unassignedSubs[0] || allSubs[0];
            if (sampleSub.current_publication_id) {
                const { data: titleData, error: titleError } = await supabase
                    .from("publication_settings")
                    .select("setting_value")
                    .eq("publication_id", sampleSub.current_publication_id)
                    .eq("setting_name", "title")
                    .single();

                if (titleError && titleError.code !== 'PGRST116') {
                    console.log(`   ⚠️ Title fetch failed: ${titleError.message}`);
                } else {
                    console.log(`   ✅ Title for ${sampleSub.id}: ${titleData?.setting_value || 'No Title Found'}`);
                }
            } else {
                console.log('   ⚠️ Sample submission has no current_publication_id');
            }
        }

        console.log('\n✅ Editor Dashboard Verification Complete.');

    } catch (error: any) {
        console.error('\n❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verifyEditorDashboard();
