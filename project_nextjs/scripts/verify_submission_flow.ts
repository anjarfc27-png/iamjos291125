import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// User provided keys directly
const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifySubmissionFlow() {
    console.log('🧪 Verifying Author Submission Workflow...\n');

    const testPath = `sub-test-${Date.now()}`;
    let journalId = '';
    let userId = '';
    let submissionId = '';
    let publicationId = '';

    try {
        // 1. Setup Environment (Journal & Author)
        console.log('1. Setting up Environment...');

        // Create Journal
        const { data: newJournalId, error: createError } = await supabase.rpc('admin_create_journal', {
            p_path: testPath,
            p_enabled: true,
            p_settings: [{ setting_name: 'name', setting_value: 'Submission Test Journal' }]
        });
        if (createError) throw new Error(`Journal create failed: ${createError.message}`);
        journalId = newJournalId;

        // Create Section
        const { data: section, error: sectionError } = await supabase.from('sections').insert({
            journal_id: journalId,
            seq: 1,
            editor_restricted: false,
            meta_indexed: true,
            meta_reviewed: true
        }).select('id').single();
        if (sectionError) throw new Error(`Section create failed: ${sectionError.message}`);
        const sectionId = section.id;

        // Create Author User
        const email = `author-${Date.now()}@example.com`;
        const { data: user, error: userError } = await supabase.auth.admin.createUser({
            email: email,
            password: 'password123',
            email_confirm: true
        });
        if (userError) throw new Error(`User create failed: ${userError.message}`);
        userId = user.user.id;

        // Sync to public.users
        const { error: publicUserError } = await supabase.from('users').insert({
            id: userId,
            username: `author${Date.now()}`,
            email: email,
            password: 'hashed_password',
            first_name: 'John',
            last_name: 'Doe'
        });
        if (publicUserError) throw new Error(`Public user insert failed: ${publicUserError.message}`);

        // Assign Author Role
        // Note: In OJS, authors usually register themselves, but here we assign explicitly for test
        await supabase.from('user_account_roles').insert({
            context_id: journalId,
            user_id: userId,
            role_name: 'author'
        });

        console.log(`   ✅ Created Journal: ${journalId}`);
        console.log(`   ✅ Created Author: ${userId}`);

        // 2. Step 1: Start Submission
        console.log('\n2. Step 1: Start Submission...');

        // Create Submission
        // Schema (2024): context_id, stage_id (int), status (int)
        const { data: sub, error: subError } = await supabase.from('submissions').insert({
            context_id: journalId,
            stage_id: 1, // Submission
            status: 1, // Queued
            locale: 'en_US'
        }).select().single();

        if (subError) throw new Error(`Submission create failed: ${subError.message}`);
        submissionId = sub.id;
        console.log(`   ✅ Created Submission: ${submissionId}`);

        // Create Publication
        const { data: pub, error: pubError } = await supabase.from('publications').insert({
            submission_id: submissionId,
            status: 1, // Queued
            version: 1,
            primary_locale: 'en_US'
        }).select().single();

        if (pubError) throw new Error(`Publication create failed: ${pubError.message}`);
        publicationId = pub.id;
        console.log(`   ✅ Created Publication: ${publicationId}`);

        // Link Publication to Submission (2024 schema has current_publication_id)
        await supabase.from('submissions').update({ current_publication_id: publicationId }).eq('id', submissionId);

        // 3. Step 2: Upload File (Simulated)
        console.log('\n3. Step 2: Upload File...');
        // Schema (2024): submission_id, file_stage (int), file_name, file_type, file_size, uploader_user_id
        const { error: fileError } = await supabase.from('submission_files').insert({
            submission_id: submissionId,
            file_stage: 1, // SUBMISSION_FILE_SUBMISSION
            file_name: 'test-manuscript.pdf',
            file_type: 'application/pdf',
            file_size: 1024,
            original_file_name: 'manuscript.pdf',
            uploader_user_id: userId,
            genre_id: null // Explicitly null
        });

        if (fileError) throw new Error(`File record insert failed: ${fileError.message}`);
        console.log('   ✅ File record inserted.');

        // 4. Step 3: Metadata (Title, Abstract, Authors)
        console.log('\n4. Step 3: Metadata...');

        // Update Publication Metadata (Settings)
        const settings = [
            { publication_id: publicationId, setting_name: 'title', setting_value: 'Test Article Title', locale: 'en_US' },
            { publication_id: publicationId, setting_name: 'abstract', setting_value: 'This is a test abstract.', locale: 'en_US' }
        ];
        const { error: setError } = await supabase.from('publication_settings').insert(settings);
        if (setError) throw new Error(`Publication settings failed: ${setError.message}`);

        // Add Author
        // Schema: email, publication_id, seq
        const { data: author, error: authorError } = await supabase.from('authors').insert({
            publication_id: publicationId,
            email: 'john@example.com',
            seq: 1,
            include_in_browse: true
        }).select().single();

        if (authorError) throw new Error(`Author insert failed: ${authorError.message}`);

        // Add Author Settings
        const authorSettings = [
            { author_id: author.id, setting_name: 'givenName', setting_value: 'John', locale: 'en_US' },
            { author_id: author.id, setting_name: 'familyName', setting_value: 'Doe', locale: 'en_US' },
            { author_id: author.id, setting_name: 'country', setting_value: 'US', locale: '' },
            { author_id: author.id, setting_name: 'affiliation', setting_value: 'University of Example', locale: 'en_US' }
        ];

        const { error: authorSettingsError } = await supabase.from('author_settings').insert(authorSettings);
        if (authorSettingsError) throw new Error(`Author settings failed: ${authorSettingsError.message}`);

        console.log('   ✅ Metadata and Author saved.');

        // 5. Verify Data
        console.log('\n5. Verifying Data Integrity...');
        const { data: checkSub } = await supabase.from('submissions').select('*, publications(*)').eq('id', submissionId).single();
        if (!checkSub) throw new Error('Submission not found');
        if (checkSub.publications.length === 0) throw new Error('Publication not linked');

        const { data: checkSettings } = await supabase.from('publication_settings').select('*').eq('publication_id', publicationId);
        if (checkSettings?.length !== 2) console.warn('   ⚠️ Warning: Expected 2 settings, got ' + checkSettings?.length);
        else console.log('   ✅ Settings verified.');

    } catch (err: any) {
        console.error('\n❌ Error:', err.message);
        if (err.details) console.error('   Details:', err.details);
        if (err.hint) console.error('   Hint:', err.hint);
    } finally {
        // Cleanup
        if (journalId) {
            console.log('\n🧹 Cleaning up...');
            await supabase.from('journals').delete().eq('id', journalId);
            if (userId) {
                await supabase.auth.admin.deleteUser(userId);
                await supabase.from('users').delete().eq('id', userId);
                await supabase.from('user_accounts').delete().eq('id', userId);
            }
        }
    }
}

verifySubmissionFlow();
