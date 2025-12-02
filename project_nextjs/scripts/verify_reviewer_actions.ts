
import { createClient } from '@supabase/supabase-js';

// Set env vars BEFORE importing app code
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcjyjmaaiutnnadwftz.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyReviewerActions() {
    console.log('Verifying Reviewer Actions...');

    // Dynamic import
    const { acceptReviewRequest, declineReviewRequest, submitReview } = await import('../src/features/reviewer/actions');

    try {
        // 1. Get the seeded submission and assignment
        const { data: sub } = await supabase
            .from('submissions')
            .select('id')
            .order('date_submitted', { ascending: false })
            .limit(1)
            .single();

        if (!sub) throw new Error('No submission found.');

        const { data: assignment } = await supabase
            .from('review_assignments')
            .select('reviewer_id, id, status')
            .eq('submission_id', sub.id)
            .limit(1)
            .single();

        if (!assignment) throw new Error('No reviewer assignment found.');
        console.log(`Assignment ID: ${assignment.id}, Current Status: ${assignment.status}`);

        // Reset status to pending (0) for testing
        await supabase.from('review_assignments').update({ status: 0, recommendation: null, date_completed: null }).eq('id', assignment.id);
        console.log('Reset status to Pending (0)');

        // 2. Test Accept
        console.log('Testing acceptReviewRequest...');
        const acceptResult = await acceptReviewRequest(assignment.id, { privacyConsent: true });
        if (!acceptResult.ok) throw new Error(`Accept failed: ${acceptResult.error}`);

        const { data: accepted } = await supabase.from('review_assignments').select('status').eq('id', assignment.id).single();
        if (accepted?.status !== 3) throw new Error(`Expected status 3 (Accepted), got ${accepted?.status}`);
        console.log('✅ Accepted successfully (Status 3)');

        // 3. Test Submit Review
        console.log('Testing submitReview...');
        const submitResult = await submitReview({
            assignmentId: assignment.id,
            recommendation: 'accept',
            commentsToAuthor: 'Great work!',
            commentsToEditor: 'Publish it.',
            competingInterests: 'None'
        });
        if (!submitResult.ok) throw new Error(`Submit failed: ${submitResult.error}`);

        const { data: completed } = await supabase.from('review_assignments').select('status, recommendation, date_completed').eq('id', assignment.id).single();
        if (completed?.status !== 5) throw new Error(`Expected status 5 (Completed), got ${completed?.status}`);
        if (completed?.recommendation !== 1) throw new Error(`Expected recommendation 1 (Accept), got ${completed?.recommendation}`);
        if (!completed?.date_completed) throw new Error('Expected date_completed to be set');
        console.log('✅ Submitted successfully (Status 5, Rec 1)');

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

verifyReviewerActions();
