import { createClient } from '@supabase/supabase-js'
import { getRolePath } from './auth'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Database helper functions
export async function getUserById(userId: string) {
  try {
    // Try user_accounts table first (new migration with actual data)
    const { data, error } = await supabaseAdmin
      .from('user_accounts')
      .select('id, username, email, password, first_name, last_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user from user_accounts:', error)
      return null
    }

    // Map the data to match our expected interface
    return data ? {
      user_id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password
    } : null
  } catch (error) {
    console.error('Exception in getUserById:', error)
    return null
  }
}

export async function getUserByEmail(email: string) {
  try {
    // Try user_accounts table first (new migration with actual data)
    const { data, error } = await supabaseAdmin
      .from('user_accounts')
      .select('id, username, email, password, first_name, last_name')
      .eq('email', email)
      .single()

    if (error) {
      console.error('Error fetching user from user_accounts:', error)
      return null
    }

    // Map the data to match our expected interface
    return data ? {
      user_id: data.id,
      username: data.username,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      password: data.password
    } : null
  } catch (error) {
    console.error('Exception in getUserByEmail:', error)
    return null
  }
}

export async function getUserRoles(userId: string) {
  try {
    console.log('Fetching roles for userId:', userId)

    // Try user_account_roles first (new migration)
    const { data: accountRolesData, error: accountRolesError } = await supabaseAdmin
      .from('user_account_roles')
      .select('role_name')
      .eq('user_id', userId)

    if (!accountRolesError && accountRolesData && accountRolesData.length > 0) {
      console.log('Found roles in user_account_roles:', accountRolesData)

      // Map to our expected format
      const roles = accountRolesData.map(role => ({
        user_group_id: role.role_name, // Use role name as ID for now
        user_group_name: role.role_name,
        context_id: null, // No context for simple roles
        journal_name: 'Site',
        role_path: getRolePath(role.role_name)
      }))

      console.log('Final roles from user_account_roles:', roles)
      return roles
    }

    console.log('No roles in user_account_roles, trying original OJS schema...')

    // Get user group IDs for this user (original OJS schema)
    const { data: userGroupData, error: userGroupError } = await supabaseAdmin
      .from('user_user_groups')
      .select('user_group_id')
      .eq('user_id', userId)

    if (userGroupError) {
      console.error('Error fetching user_user_groups:', userGroupError)
      return []
    }

    console.log('User group data:', userGroupData)

    if (!userGroupData || userGroupData.length === 0) {
      return []
    }

    // Get user group details
    const userGroupIds = userGroupData.map(ug => ug.user_group_id)
    const { data: userGroupsData, error: userGroupsError } = await supabaseAdmin
      .from('user_groups')
      .select(`
        id,
        context_id,
        role_id
      `)
      .in('id', userGroupIds)

    if (userGroupsError) {
      console.error('Error fetching user_groups:', userGroupsError)
      return []
    }

    console.log('User groups data:', userGroupsData)

    // Get user group settings for names
    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('user_group_settings')
      .select('user_group_id, setting_name, setting_value')
      .in('user_group_id', userGroupIds)
      .eq('setting_name', 'name')
      .or('locale.eq.,locale.eq.en_US')

    if (settingsError) {
      console.error('Error fetching user_group_settings:', settingsError)
    }

    console.log('Settings data:', settingsData)

    // Get journal settings for context names (hanya jika ada context_id)
    const contextIds = userGroupsData?.map(ug => ug.context_id).filter(Boolean) || []
    let journalSettings: Array<{ journal_id: string; setting_name: string; setting_value: string }> = []
    if (contextIds.length > 0) {
      try {
        const { data: journalData, error: journalError } = await supabaseAdmin
          .from('journal_settings')
          .select('journal_id, setting_name, setting_value')
          .in('journal_id', contextIds)
          .eq('setting_name', 'name')
          .or('locale.eq.,locale.eq.en_US')

        if (journalError) {
          console.error('Error fetching journal_settings:', journalError)
        } else {
          journalSettings = journalData || []
        }
      } catch (journalQueryError) {
        console.error('Exception fetching journal_settings:', journalQueryError)
      }
    }

    console.log('Journal settings:', journalSettings)

    // Combine all data
    const roles = userGroupsData?.map(ug => {
      const setting = settingsData?.find(s => s.user_group_id === ug.id)
      const journalSetting = journalSettings.find(js => js.journal_id === ug.context_id)

      const userGroupName = setting?.setting_value || `Role ${ug.role_id}`
      const journalName = journalSetting?.setting_value || (ug.context_id ? 'Journal' : 'Site')

      return {
        user_group_id: ug.id,
        user_group_name: userGroupName,
        context_id: ug.context_id,
        journal_name: journalName,
        role_path: getRolePath(userGroupName)
      }
    }) || []

    console.log('Final roles from OJS schema:', roles)
    return roles
  } catch (error) {
    console.error('Exception in getUserRoles:', error)
    return []
  }
}