import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugInsert() {
    console.log('🐞 Debugging Insert...');

    // Create dummy user/journal first
    const testPath = `debug-${Date.now()}`;
    const { data: journalId, error: cjErr } = await supabase.rpc('admin_create_journal', {
        p_path: testPath,
        p_enabled: true,
        p_settings: [{ setting_name: 'name', setting_value: 'Debug Journal' }]
    });
    if (cjErr) { console.error('Journal Create Error:', cjErr); return; }

    const { data: user, error: cuErr } = await supabase.auth.admin.createUser({
        email: `debug-${Date.now()}@example.com`,
        password: 'password123',
        email_confirm: true
    });
    if (cuErr) { console.error('User Create Error:', cuErr); return; }
    const userId = user.user.id;

    await supabase.from('users').insert({ id: userId, username: `debug${Date.now()}`, email: user.user.email });

    // Create user_accounts record with SAME ID as auth user
    const { data: userAccount, error: uaErr } = await supabase.from('user_accounts').insert({
        id: userId, // Force same ID
        username: `debug${Date.now()}`,
        email: user.user.email,
        password: 'password123',
        first_name: 'Debug',
        last_name: 'User'
    }).select('id').single();

    if (uaErr) { console.error('User Account Create Error:', uaErr); return; }
    const userAccountId = userAccount.id;
    console.log('Created User Account with ID:', userAccountId);
    console.log('Matches Auth ID:', userAccountId === userId);

    // Test 1: context_id + role_name
    console.log('Test 1: context_id + role_name');
    const { error: err1 } = await supabase.from('user_account_roles').insert({
        user_id: userAccountId,
        context_id: journalId,
        role_name: 'manager'
    });
    if (err1) console.log('❌ Test 1 Failed:', err1.message);
    else console.log('✅ Test 1 Success');

    // Test 2: journal_id + role (Legacy)
    console.log('Test 2: journal_id + role');
    const { error: err2 } = await supabase.from('user_account_roles').insert({
        user_id: userAccountId,
        journal_id: journalId,
        role: 'manager'
    });
    if (err2) console.log('❌ Test 2 Failed:', err2.message);
    else console.log('✅ Test 2 Success');

    // Cleanup
    await supabase.from('journals').delete().eq('id', journalId);
    await supabase.auth.admin.deleteUser(userId);
    await supabase.from('users').delete().eq('id', userId);
    await supabase.from('user_accounts').delete().eq('id', userAccountId);
}

debugInsert();
