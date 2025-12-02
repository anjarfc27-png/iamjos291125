
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedTestSubmission() {
    console.log('Seeding Test Submission...');

    try {
        // 1. Get a Journal (Context)
        const { data: journal } = await supabase.from('journals').select('id').limit(1).single();
        if (!journal) throw new Error('No journal found. Please create one first.');
        const journalId = journal.id;

        // 2. Create Submission
        const { data: sub, error: subError } = await supabase.from('submissions').insert({
            context_id: journalId,
            stage_id: 1, // Submission
            status: 1, // Queued
            locale: 'en_US'
        }).select().single();

        if (subError) throw new Error(`Submission create failed: ${subError.message}`);
        console.log(`✅ Created Submission: ${sub.id}`);

        // 3. Create Publication
        const { data: pub, error: pubError } = await supabase.from('publications').insert({
            submission_id: sub.id,
            status: 1, // Queued
            version: 1,
            primary_locale: 'en_US'
        }).select().single();

        if (pubError) throw new Error(`Publication create failed: ${pubError.message}`);
        console.log(`✅ Created Publication: ${pub.id}`);

        // 4. Link Publication
        await supabase.from('submissions').update({ current_publication_id: pub.id }).eq('id', sub.id);

        // 5. Add Title
        await supabase.from('publication_settings').insert({
            publication_id: pub.id,
            setting_name: 'title',
            setting_value: 'Seeded Test Submission for Editor Verification',
            locale: 'en_US'
        });
        console.log('✅ Added Title');

        // 6. Add Author (Optional but good for completeness)
        // We need a user ID. Let's pick the first user found or create a dummy one?
        // Let's just pick a user if exists.
        const { data: user } = await supabase.from('users').select('id').limit(1).single();
        if (user) {
            // Add to stage_assignments as author
            // Need author user group
            const { data: authorGroup } = await supabase.from('user_groups').select('id').eq('context_id', journalId).eq('role_id', 65536).limit(1).single();
            if (authorGroup) {
                await supabase.from('stage_assignments').insert({
                    submission_id: sub.id,
                    user_group_id: authorGroup.id,
                    user_id: user.id,
                    date_assigned: new Date().toISOString()
                });
                console.log('✅ Assigned Author');
            }
        }

    } catch (error: any) {
        console.error('❌ Seeding Failed:', error.message);
    }
}

seedTestSubmission();
