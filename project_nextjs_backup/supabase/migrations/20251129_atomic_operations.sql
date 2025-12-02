-- Function to merge users atomically
CREATE OR REPLACE FUNCTION admin_merge_users(
    source_user_id UUID,
    target_user_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Reassign Submissions
    UPDATE submissions
    SET submitter_id = target_user_id
    WHERE submitter_id = source_user_id;

    -- 2. Reassign Review Assignments
    UPDATE review_assignments
    SET reviewer_id = target_user_id
    WHERE reviewer_id = source_user_id;

    -- 3. Reassign Editor Decisions
    UPDATE edit_decisions
    SET editor_id = target_user_id
    WHERE editor_id = source_user_id;

    -- 4. Reassign Roles (Merge)
    -- Insert roles from source to target, ignoring duplicates
    INSERT INTO user_account_roles (user_id, role, journal_id)
    SELECT target_user_id, role, journal_id
    FROM user_account_roles
    WHERE user_id = source_user_id
    ON CONFLICT DO NOTHING;

    -- 5. Delete Source User
    -- This should cascade to user_accounts and other related tables if FKs are set up correctly
    -- However, we can't delete from auth.users directly here easily without elevated privileges extension
    -- So we will rely on the calling code to delete the auth user, OR we delete from public tables here
    -- and let the caller handle the auth user deletion.
    
    -- Delete from public.user_accounts
    DELETE FROM user_accounts WHERE id = source_user_id;
    
    -- Delete from user_account_roles (if not cascaded)
    DELETE FROM user_account_roles WHERE user_id = source_user_id;

END;
$$;

-- Function to create journal atomically
CREATE OR REPLACE FUNCTION admin_create_journal(
    p_path TEXT,
    p_enabled BOOLEAN,
    p_settings JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_journal_id UUID;
    setting RECORD;
BEGIN
    -- Insert Journal
    INSERT INTO journals (path, enabled)
    VALUES (p_path, p_enabled)
    RETURNING id INTO new_journal_id;

    -- Insert Settings
    FOR setting IN SELECT * FROM jsonb_to_recordset(p_settings) AS x(setting_name TEXT, setting_value TEXT)
    LOOP
        INSERT INTO journal_settings (journal_id, setting_name, setting_value)
        VALUES (new_journal_id, setting.setting_name, setting.setting_value);
    END LOOP;

    RETURN new_journal_id;
END;
$$;
