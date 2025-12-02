import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditRoleConsistency() {
    console.log('🕵️ Starting Deep Role Consistency Audit (Split-Brain Check)...\n');

    // 1. Fetch all assignments from Simple Table (user_account_roles)
    const { data: simpleRoles, error: simpleError } = await supabase
        .from('user_account_roles')
        .select('*');

    if (simpleError) {
        console.error('❌ Error fetching user_account_roles:', simpleError.message);
        return;
    }

    // 2. Fetch all assignments from OJS Standard Tables (user_user_groups -> user_groups)
    const { data: ojsRoles, error: ojsError } = await supabase
        .from('user_user_groups')
        .select(`
      user_id,
      user_groups (
        id,
        role_id,
        context_id
      )
    `);

    if (ojsError) {
        console.error('❌ Error fetching user_user_groups:', ojsError.message);
        return;
    }

    console.log(`📊 Stats:`);
    console.log(`- Simple Roles (user_account_roles): ${simpleRoles.length}`);
    console.log(`- OJS Roles (user_user_groups): ${ojsRoles.length}`);

    // 3. Analyze Discrepancies
    let missingInOJS = 0;

    // Map OJS roles for fast lookup: "userId_journalId_roleId"
    const ojsMap = new Set();
    ojsRoles.forEach((uug: any) => {
        if (uug.user_groups) {
            const key = `${uug.user_id}_${uug.user_groups.context_id}_${uug.user_groups.role_id}`;
            ojsMap.add(key);
        }
    });

    // Check Simple -> OJS
    console.log('\n--- Checking Consistency: Simple -> OJS (Critical for RLS) ---');
    for (const simple of simpleRoles) {
        if (!simple.role_id) {
            // Skip if role_id is missing (should be cleaned up by now, but just in case)
            continue;
        }

        const key = `${simple.user_id}_${simple.journal_id}_${simple.role_id}`;
        if (!ojsMap.has(key)) {
            console.log(`❌ MISSING IN OJS: User ${simple.user_id} has role ${simple.role_id}`);
            missingInOJS++;
        }
    }

    if (missingInOJS > 0) {
        console.log(`\n🚨 FAIL: ${missingInOJS} missing roles.`);
    } else {
        console.log('\n✅ PASS: All roles synced.');
    }
}

auditRoleConsistency();
