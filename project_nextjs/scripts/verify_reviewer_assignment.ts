
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyReviewerAssignment() {
    console.log('Verifying Reviewer Assignment...');

    try {
        // 1. Get the seeded submission
        const { data: sub } = await supabase
            .from('submissions')
            .select('id, context_id')
            .order('date_submitted', { ascending: false })
            .limit(1)
            .single();

        if (!sub) throw new Error('No submission found. Run seed_test_submission.ts first.');
        console.log(`Using Submission: ${sub.id}`);

        // 2. Ensure Review Round exists
        let { data: round } = await supabase
            .from('review_rounds')
            .select('id')
            .eq('submission_id', sub.id)
            .eq('round', 1)
            .maybeSingle();

        if (!round) {
            console.log('Creating Review Round 1...');
            const { data: newRound, error: roundError } = await supabase
                .from('review_rounds')
                .insert({
                    submission_id: sub.id,
                    stage_id: 3, // Review stage ID
                    round: 1,
                    status: 1 // Active? Need to check status mapping. Assuming 1 is active.
                })
                .select()
                .single();

            if (roundError) throw new Error(`Failed to create round: ${roundError.message}`);
            round = newRound;
        }

        if (!round) throw new Error('Review round not found or created.');
        console.log(`Using Review Round: ${round.id}`);

        // 3. Get a potential reviewer (User)
        const { data: user } = await supabase.from('user_accounts').select('id').limit(1).single();
        if (!user) throw new Error('No user found.');
        console.log(`Using Reviewer User: ${user.id}`);

        // 4. Assign Reviewer (Simulate Action)
        console.log('Assigning Reviewer...');
        const reviewId = randomUUID();
        const { error: assignError } = await supabase.from('review_assignments').insert({
            id: reviewId,
            submission_id: sub.id,
            review_round_id: round.id,
            reviewer_id: user.id,
            stage_id: 3, // Review
            // review_method: 1, // Omitted as it doesn't exist
            date_assigned: new Date().toISOString(),
            status: 0 // Pending
        });

        if (assignError) throw new Error(`Assignment failed: ${assignError.message}`);
        console.log(`✅ Reviewer Assigned: ${reviewId}`);

        // 5. Verify Fetching
        console.log('Verifying Fetch...');
        const { data: fetchedAssignment, error: fetchError } = await supabase
            .from('review_assignments')
            .select('id, reviewer_id, status')
            .eq('id', reviewId)
            .single();

        if (fetchError) throw new Error(`Fetch failed: ${fetchError.message}`);
        console.log(`✅ Fetched Assignment: ${fetchedAssignment.id}, Status: ${fetchedAssignment.status}`);

        // 6. Verify Nested Query (Simulating getSubmissionDetail)
        console.log('Verifying Nested Query...');
        const { data: nestedData, error: nestedError } = await supabase
            .from('submissions')
            .select(`
                id,
                review_rounds (
                    id,
                    stage_id,
                    round,
                    status,
                    review_assignments (
                        id,
                        reviewer_id,
                        status
                    )
                )
            `)
            .eq('id', sub.id)
            .single();

        if (nestedError) throw new Error(`Nested query failed: ${nestedError.message}`);
        console.log('✅ Nested Query Result:', JSON.stringify(nestedData, null, 2));

        // 7. Clean up
        // await supabase.from('review_assignments').delete().eq('id', reviewId);

    } catch (error: any) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verifyReviewerAssignment();
