
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditDatabase() {
    console.log('Starting Database Audit...');

    // 1. List all tables
    // Note: Supabase JS client doesn't have a direct "list tables" method for public schema easily accessible without using rpc or specific query if permissions allow.
    // However, we can try to query information_schema if the user has permissions, or just check for known duplicates.
    // Since we are service_role, we might have access.

    // Let's try to fetch from information_schema.tables
    // Note: PostgREST usually doesn't expose information_schema by default. 
    // If that fails, we will check specific known potential duplicates.

    const potentialDuplicates = [
        ['email_templates', 'emails'],
        ['navigation_menus', 'menus'],
        ['review_forms', 'forms'],
        ['announcements', 'news'],
        ['journals', 'contexts'], // OJS uses 'journals', sometimes 'contexts' is used in abstract
        ['submissions', 'articles'],
        ['users', 'user_accounts'] // We use user_accounts, Supabase uses auth.users. Check for 'users' table in public.
    ];

    console.log('\n--- Checking for Potential Duplicate/Conflicting Tables ---');
    for (const [table1, table2] of potentialDuplicates) {
        const { error: err1 } = await supabase.from(table1).select('*').limit(1);
        const { error: err2 } = await supabase.from(table2).select('*').limit(1);

        const exists1 = !err1;
        const exists2 = !err2;

        if (exists1 && exists2) {
            console.log(`[WARNING] Both '${table1}' and '${table2}' exist! Possible duplication.`);
        } else if (exists1) {
            console.log(`[OK] '${table1}' exists.`);
        } else if (exists2) {
            console.log(`[OK] '${table2}' exists (instead of ${table1}).`);
        } else {
            console.log(`[MISSING] Neither '${table1}' nor '${table2}' found.`);
        }
    }

    console.log('\n--- Checking Critical OJS 3.3 Tables ---');
    const criticalTables = [
        'journals', 'journal_settings',
        'sections', 'section_settings',
        'issues', 'issue_settings',
        'submissions', 'submission_settings',
        'authors', 'author_settings',
        'publication_settings',
        'review_assignments',
        'review_rounds',
        'stage_assignments',
        'user_groups',
        'user_user_groups'
    ];

    for (const table of criticalTables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`[ERROR] Critical table '${table}' missing or inaccessible: ${error.message}`);
        } else {
            // console.log(`[OK] '${table}' verified.`);
        }
    }
    console.log('[OK] Critical table check complete.');

}

auditDatabase();
