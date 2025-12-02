
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                process.env[key.trim()] = value;
            }
        }
    });
} catch (error) {
    console.error('Error loading .env.local:', error);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

function getRolePath(userGroupName: string): string {
    const normalized = userGroupName?.trim() || '';

    const rolePaths: Record<string, string> = {
        'site admin': 'admin',
        'manager': 'manager',
        'editor': 'editor',
        'section editor': 'section_editor',
        'assistant': 'assistant',
        'copyeditor': 'copyeditor',
        'proofreader': 'proofreader',
        'layout editor': 'layout-editor',
        'author': 'author',
        'reviewer': 'reviewer',
        'reader': 'reader',
        'subscription manager': 'subscription-manager'
    };

    const lowerNormalized = normalized.toLowerCase();
    if (rolePaths[lowerNormalized]) {
        return rolePaths[lowerNormalized];
    }

    if (rolePaths[userGroupName]) {
        return rolePaths[userGroupName];
    }

    return 'reader';
}

async function getUserRoles(userId: string) {
    try {
        console.log('Fetching roles for userId:', userId);

        // Try user_account_roles first (new migration)
        const { data: accountRolesData, error: accountRolesError } = await supabaseAdmin
            .from('user_account_roles')
            .select('role_name')
            .eq('user_id', userId);

        if (!accountRolesError && accountRolesData && accountRolesData.length > 0) {
            console.log('Found roles in user_account_roles:', accountRolesData);

            const roles = accountRolesData.map(role => ({
                user_group_id: role.role_name,
                user_group_name: role.role_name,
                context_id: null,
                journal_name: 'Site',
                role_path: getRolePath(role.role_name)
            }));

            console.log('Final roles from user_account_roles:', roles);
            return roles;
        }

        console.log('No roles in user_account_roles, trying original OJS schema...');

        // Get user group IDs for this user (original OJS schema)
        const { data: userGroupData, error: userGroupError } = await supabaseAdmin
            .from('user_user_groups')
            .select('user_group_id')
            .eq('user_id', userId);

        if (userGroupError) {
            console.error('Error fetching user_user_groups:', userGroupError);
            return [];
        }

        console.log('User group data:', userGroupData);

        if (!userGroupData || userGroupData.length === 0) {
            return [];
        }

        // Get user group details
        const userGroupIds = userGroupData.map(ug => ug.user_group_id);
        const { data: userGroupsData, error: userGroupsError } = await supabaseAdmin
            .from('user_groups')
            .select(`
        id,
        context_id,
        role_id
      `)
            .in('id', userGroupIds);

        if (userGroupsError) {
            console.error('Error fetching user_groups:', userGroupsError);
            return [];
        }

        console.log('User groups data:', userGroupsData);

        // Get user group settings for names
        const { data: settingsData, error: settingsError } = await supabaseAdmin
            .from('user_group_settings')
            .select('user_group_id, setting_name, setting_value')
            .in('user_group_id', userGroupIds)
            .eq('setting_name', 'name')
            .or('locale.eq.,locale.eq.en_US');

        if (settingsError) {
            console.error('Error fetching user_group_settings:', settingsError);
        }

        console.log('Settings data:', settingsData);

        // Get journal settings for context names
        const contextIds = userGroupsData?.map(ug => ug.context_id).filter(Boolean) || [];
        let journalSettings: Array<{ journal_id: string; setting_name: string; setting_value: string }> = [];
        if (contextIds.length > 0) {
            try {
                const { data: journalData, error: journalError } = await supabaseAdmin
                    .from('journal_settings')
                    .select('journal_id, setting_name, setting_value')
                    .in('journal_id', contextIds)
                    .eq('setting_name', 'name')
                    .or('locale.eq.,locale.eq.en_US');

                if (journalError) {
                    console.error('Error fetching journal_settings:', journalError);
                } else {
                    journalSettings = journalData || [];
                }
            } catch (journalQueryError) {
                console.error('Exception fetching journal_settings:', journalQueryError);
            }
        }

        console.log('Journal settings:', journalSettings);

        // Combine all data
        const roles = userGroupsData?.map(ug => {
            const setting = settingsData?.find(s => s.user_group_id === ug.id);
            const journalSetting = journalSettings.find(js => js.journal_id === ug.context_id);

            const userGroupName = setting?.setting_value || `Role ${ug.role_id}`;
            const journalName = journalSetting?.setting_value || (ug.context_id ? 'Journal' : 'Site');

            return {
                user_group_id: ug.id,
                user_group_name: userGroupName,
                context_id: ug.context_id,
                journal_name: journalName,
                role_path: getRolePath(userGroupName)
            };
        }) || [];

        console.log('Final roles from OJS schema:', roles);
        return roles;
    } catch (error) {
        console.error('Exception in getUserRoles:', error);
        return [];
    }
}

async function test() {
    console.log('Fetching admin user from user_accounts...');
    const { data: userAccount, error: accountError } = await supabaseAdmin
        .from('user_accounts')
        .select('id, username, email')
        .eq('email', 'admin@ojs.test')
        .single();

    if (userAccount) {
        console.log(`User in user_accounts: ${userAccount.id} (${userAccount.username})`);
    } else {
        console.log('User not found in user_accounts');
    }

    console.log('Fetching admin user from users (by username)...');
    const { data: oldUser, error: oldError } = await supabaseAdmin
        .from('users')
        .select('user_id:id, username, email')
        .eq('username', 'admin')
        .single();

    if (oldUser) {
        console.log(`User in users: ${oldUser.user_id} (${oldUser.username})`);
    } else {
        console.log('User not found in users (by username)');
    }

    if (userAccount && oldUser && userAccount.id !== oldUser.user_id) {
        console.warn('WARNING: IDs do not match!');
        console.warn(`user_accounts ID: ${userAccount.id}`);
        console.warn(`users ID: ${oldUser.user_id}`);
    }

    const userIdToTest = userAccount?.id || oldUser?.user_id;

    if (!userIdToTest) {
        console.error('Admin user not found in either table!');
        return;
    }

    console.log(`Testing getUserRoles for user: ${userIdToTest}`);
    const roles = await getUserRoles(userIdToTest);
    console.log('Roles:', JSON.stringify(roles, null, 2));

    if (userAccount && oldUser && userAccount.id !== oldUser.user_id) {
        console.log(`Testing getUserRoles for OLD user ID: ${oldUser.user_id}`);
        const oldRoles = await getUserRoles(oldUser.user_id);
        console.log('Old Roles:', JSON.stringify(oldRoles, null, 2));
    }

    console.log('Checking user_user_groups content...');
    const { data: uug, error: uugError } = await supabaseAdmin
        .from('user_user_groups')
        .select('*')
        .limit(5);

    if (uug) {
        console.log('user_user_groups sample:', JSON.stringify(uug, null, 2));
    } else {
        console.error('Error fetching user_user_groups:', uugError);
    }
}

test().catch(console.error);
