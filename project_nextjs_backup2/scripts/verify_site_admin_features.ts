
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPluginGallery() {
    console.log('\n--- Verifying Plugin Gallery ---');
    const testPluginId = 'test-plugin-' + Date.now();

    // 1. Install Plugin (Simulate)
    console.log(`Installing plugin: ${testPluginId}`);
    const { error: installError } = await supabase.from('site_plugins').insert({
        id: testPluginId,
        name: 'Test Plugin',
        description: 'A plugin for testing verification script',
        category: 'testing',
        enabled: false,
        version: '1.0.0',
        author: 'Tester',
        configurable: true
    });

    if (installError) {
        console.error('Failed to install plugin:', installError);
        return false;
    }
    console.log('Plugin installed successfully.');

    // 2. Verify Installation
    const { data: plugin, error: fetchError } = await supabase
        .from('site_plugins')
        .select('*')
        .eq('id', testPluginId)
        .single();

    if (fetchError || !plugin) {
        console.error('Failed to fetch installed plugin:', fetchError);
        return false;
    }
    console.log('Plugin verified in database.');

    // 3. Uninstall Plugin
    console.log('Uninstalling plugin...');
    const { error: uninstallError } = await supabase
        .from('site_plugins')
        .delete()
        .eq('id', testPluginId);

    if (uninstallError) {
        console.error('Failed to uninstall plugin:', uninstallError);
        return false;
    }

    // 4. Verify Uninstallation
    const { data: deletedPlugin } = await supabase
        .from('site_plugins')
        .select('*')
        .eq('id', testPluginId)
        .single();

    if (deletedPlugin) {
        console.error('Plugin still exists after uninstallation!');
        return false;
    }
    console.log('Plugin uninstalled successfully.');
    return true;
}

async function verifyJournalWizardPersistence() {
    console.log('\n--- Verifying Journal Wizard Persistence ---');
    const testJournalPath = 'test-wizard-' + Date.now();

    // 1. Create Journal (Manual Insert - Bypass RPC)
    console.log(`Creating test journal: ${testJournalPath}`);

    const { data: journalData, error: createError } = await supabase
        .from('journals')
        .insert({
            path: testJournalPath,
            enabled: true
        })
        .select('id')
        .single();

    if (createError) {
        console.error('Failed to create journal:', createError);
        return false;
    }

    const journalId = journalData.id;
    console.log(`Journal created with ID: ${journalId}`);

    // Insert initial settings manually (mimic RPC)
    await supabase.from('journal_settings').insert([
        { journal_id: journalId, setting_name: 'name', setting_value: 'Test Wizard Journal', locale: '' }
    ]);

    // 2. Simulate Wizard Completion (Step 3: Sections & Plugins)
    // We manually insert sections and settings as the action does
    console.log('Simulating Wizard Completion (Sections & Plugins)...');

    // Insert Sections
    const sections = [
        { title: 'Test Articles', abbrev: 'ART', policy: 'Test Policy' },
        { title: 'Test Reviews', abbrev: 'REV', policy: 'Review Policy' }
    ];

    for (const [index, section] of sections.entries()) {
        const { data: sectionData, error: sectionError } = await supabase
            .from('sections')
            .insert({
                journal_id: journalId,
                seq: index + 1,
                editor_restricted: false,
                meta_indexed: true,
                meta_reviewed: true
            })
            .select('id')
            .single();

        if (sectionError) {
            console.error('Failed to create section:', sectionError);
            return false;
        }

        await supabase.from('section_settings').insert([
            { section_id: sectionData.id, setting_name: 'title', setting_value: section.title, locale: '' },
            { section_id: sectionData.id, setting_name: 'abbrev', setting_value: section.abbrev, locale: '' }
        ]);
    }
    console.log('Sections created.');

    // Insert Plugin Settings
    const testPluginId = 'quickSubmit';
    const { error: pluginError } = await supabase.from('journal_settings').insert({
        journal_id: journalId,
        setting_name: `plugin_enabled_${testPluginId}`,
        setting_value: 'true',
        locale: ''
    });

    if (pluginError) {
        console.error('Failed to enable plugin:', pluginError);
        return false;
    }
    console.log('Plugin settings saved.');

    // 3. Verify Persistence
    // Check Sections
    const { count: sectionCount } = await supabase
        .from('sections')
        .select('*', { count: 'exact', head: true })
        .eq('journal_id', journalId);

    if (sectionCount !== 2) {
        console.error(`Expected 2 sections, found ${sectionCount}`);
        return false;
    }
    console.log('Verified 2 sections created.');

    // Check Plugin Settings
    const { data: pluginSetting } = await supabase
        .from('journal_settings')
        .select('*')
        .eq('journal_id', journalId)
        .eq('setting_name', `plugin_enabled_${testPluginId}`)
        .single();

    if (!pluginSetting || pluginSetting.setting_value !== 'true') {
        console.error('Plugin setting verification failed.');
        return false;
    }
    console.log('Verified plugin setting enabled.');

    // Cleanup
    console.log('Cleaning up test journal...');
    await supabase.from('journals').delete().eq('id', journalId);
    console.log('Cleanup complete.');

    return true;
}

async function run() {
    const gallerySuccess = await verifyPluginGallery();
    const wizardSuccess = await verifyJournalWizardPersistence();

    if (gallerySuccess && wizardSuccess) {
        console.log('\n✅ ALL CHECKS PASSED');
        process.exit(0);
    } else {
        console.error('\n❌ SOME CHECKS FAILED');
        process.exit(1);
    }
}

run();
