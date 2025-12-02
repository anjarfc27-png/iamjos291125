import { createClient } from '@supabase/supabase-js';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function forensicAudit() {
    console.log('🔍 Starting Forensic System Audit...\n');

    // 1. Check for Orphaned Submissions
    console.log('--- 1. Checking Orphaned Submissions ---');
    const { data: orphanedSubs, error: subError } = await supabase
        .from('submissions')
        .select('id, context_id')
        .is('context_id', null);

    if (subError) console.error('Error checking submissions:', subError.message);
    else if (orphanedSubs && orphanedSubs.length > 0) {
        console.log(`❌ Found ${orphanedSubs.length} submissions without a Journal.`);
    } else {
        console.log('✅ All submissions belong to a Journal.');
    }

    // 2. Check for Orphaned Files
    console.log('\n--- 2. Checking Orphaned Files ---');
    const { data: orphanedFiles, error: fileError } = await supabase
        .from('submission_files')
        .select('id')
        .is('submission_id', null);

    if (fileError) console.error('Error checking files:', fileError.message);
    else if (orphanedFiles && orphanedFiles.length > 0) {
        console.log(`❌ Found ${orphanedFiles.length} files without a Submission.`);
    } else {
        console.log('✅ All files belong to a Submission.');
    }

    // 3. Check Workflow State Consistency
    console.log('\n--- 3. Checking Workflow State Consistency ---');
    const { data: invalidStateSubs, error: stateError } = await supabase
        .from('submissions')
        .select('id')
        .eq('status', 3) // Published
        .eq('stage_id', 1); // Submission Stage

    if (stateError) console.error('Error checking states:', stateError.message);
    else if (invalidStateSubs && invalidStateSubs.length > 0) {
        console.log(`❌ Found ${invalidStateSubs.length} PUBLISHED submissions still in SUBMISSION stage.`);
    } else {
        console.log('✅ Published submissions have valid stage.');
    }

    // 4. Check Email Templates
    console.log('\n--- 4. Checking Email Templates ---');
    const { count: templateCount, error: tmplError } = await supabase
        .from('email_templates')
        .select('*', { count: 'exact', head: true });

    if (tmplError) console.error('Error checking templates:', tmplError.message);
    else {
        console.log(`ℹ️ Total Email Templates: ${templateCount}`);
        if (templateCount === 0) {
            console.log('❌ No email templates found! System emails will fail.');
        } else if (templateCount && templateCount < 10) {
            console.log('⚠️ Low email template count. Standard OJS has ~50+ templates.');
        } else {
            console.log('✅ Email templates appear populated.');
        }
    }

    // 5. Check User Roles
    console.log('\n--- 5. Checking User Roles ---');
    const { count: roleCount, error: roleError } = await supabase
        .from('user_account_roles')
        .select('*', { count: 'exact', head: true });

    if (roleError) console.error('Error checking roles:', roleError.message);
    else {
        console.log(`ℹ️ Total User Role Assignments: ${roleCount}`);
        if (roleCount === 0) {
            console.log('⚠️ No user roles assigned. No one can access backend features.');
        } else {
            console.log('✅ User roles exist.');
        }
    }
}

forensicAudit();
