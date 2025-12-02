import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const FUNCTIONS_TO_CHECK = [
    { name: 'admin_create_journal', params: { p_path: 'test', p_enabled: false, p_settings: [] } },
    { name: 'admin_merge_users', params: { source_user_id: '00000000-0000-0000-0000-000000000000', target_user_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'is_site_admin', params: {} },
    { name: 'has_journal_role', params: { journal_id: '00000000-0000-0000-0000-000000000000', role_ids: [1] } },
    { name: 'is_assigned_to_submission', params: { submission_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'is_submission_author', params: { submission_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'can_access_journal_bucket', params: { journal_id: '00000000-0000-0000-0000-000000000000' } },
];

async function verifyFunctions() {
    console.log('Verifying Database Functions (Target: abcjyjmaaiutnnadwftz)...\n');

    const results: Record<string, string> = {};

    for (const func of FUNCTIONS_TO_CHECK) {
        try {
            const { error } = await supabase.rpc(func.name, func.params);

            if (error) {
                if (error.message.includes('Could not find the function')) {
                    results[func.name] = 'MISSING ❌';
                } else {
                    // Any other error means the function exists but failed (e.g., permission, validation, auth)
                    // This counts as "EXISTS" for our purpose (schema check)
                    results[func.name] = `EXISTS ✅ (Error: ${error.message})`;
                }
            } else {
                results[func.name] = 'EXISTS ✅';
            }
        } catch (err: any) {
            results[func.name] = `ERROR ⚠️ (${err.message})`;
        }
    }

    // console.table(results);
    console.log(JSON.stringify(results, null, 2));
}

verifyFunctions();
