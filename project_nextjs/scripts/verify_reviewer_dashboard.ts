
import { createClient } from '@supabase/supabase-js';

// Set env vars BEFORE importing app code
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcjyjmaaiutnnadwftz.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'; // Required by env.ts
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyReviewerDashboard() {
    console.log('Verifying Reviewer Dashboard...');

    // Dynamic import to ensure env vars are set first
    const { getReviewerAssignments, getReviewerAssignment } = await import('../src/features/reviewer/data');

    try {
        // 1. Get the seeded submission to find the reviewer
        const { data: sub } = await supabase
            .from('submissions')
            .select('id')
            .order('date_submitted', { ascending: false })
            .limit(1)
            .single();

        if (!sub) throw new Error('No submission found.');
        console.log(`Using Submission: ${sub.id}`);

        // 2. Find the reviewer assigned to this submission
        const { data: assignment } = await supabase
            .from('review_assignments')
            .select('reviewer_id, id')
            .eq('submission_id', sub.id)
            .limit(1)
            .single();

        if (!assignment) throw new Error('No reviewer assignment found for this submission.');
        console.log(`Found Reviewer: ${assignment.reviewer_id}`);
        console.log(`Assignment ID: ${assignment.id}`);

        // 3. Test getReviewerAssignments
        console.log('Testing getReviewerAssignments...');
        const assignments = await getReviewerAssignments(assignment.reviewer_id);
        console.log(`Fetched ${assignments.length} assignments.`);

        if (assignments.length === 0) throw new Error('Expected at least one assignment.');

        const targetAssignment = assignments.find(a => a.id === assignment.id);
        if (!targetAssignment) throw new Error('Target assignment not found in list.');

        console.log('✅ Assignment found in list:');
        console.log(`   - ID: ${targetAssignment.id}`);
        console.log(`   - Title: ${targetAssignment.submissionTitle}`);
        console.log(`   - Status: ${targetAssignment.status}`);
        console.log(`   - Stage: ${targetAssignment.stage}`);

        // 4. Test getReviewerAssignment (Single)
        console.log('Testing getReviewerAssignment (Single)...');
        const singleAssignment = await getReviewerAssignment(assignment.id, assignment.reviewer_id);

        if (!singleAssignment) throw new Error('Failed to fetch single assignment.');
        console.log('✅ Single Assignment fetched:');
        console.log(`   - ID: ${singleAssignment.id}`);
        console.log(`   - Title: ${singleAssignment.submissionTitle}`);
        console.log(`   - Abstract: ${singleAssignment.abstract ? singleAssignment.abstract.substring(0, 50) + '...' : 'N/A'}`);

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

verifyReviewerDashboard();
