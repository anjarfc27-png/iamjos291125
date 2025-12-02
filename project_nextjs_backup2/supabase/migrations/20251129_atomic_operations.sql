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

-- Sync Roles Function (Fix Split Brain)
CREATE OR REPLACE FUNCTION admin_sync_roles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
    v_role_id INTEGER;
    v_group_id UUID;
BEGIN
    FOR r IN SELECT * FROM user_account_roles LOOP
        -- 1. Determine Role ID
        IF r.role_id IS NOT NULL THEN
            v_role_id := r.role_id;
        ELSE
            -- Map string roles to OJS IDs
            CASE r.role
                WHEN 'manager' THEN v_role_id := 16;
                WHEN 'editor' THEN v_role_id := 17;
                WHEN 'section_editor' THEN v_role_id := 17; -- Treat as editor for now
                WHEN 'reviewer' THEN v_role_id := 4096;
                WHEN 'author' THEN v_role_id := 65536;
                WHEN 'reader' THEN v_role_id := 1048576;
                ELSE v_role_id := 65536; -- Default to Author
            END CASE;
        END IF;

        -- 2. Find or Create User Group
        -- Check if group exists for this context and role
        v_group_id := NULL;
        
        SELECT id INTO v_group_id 
        FROM user_groups 
        WHERE context_id = r.journal_id AND role_id = v_role_id 
        LIMIT 1;

        IF v_group_id IS NULL THEN
            INSERT INTO user_groups (context_id, role_id, is_default, show_title)
            VALUES (r.journal_id, v_role_id, TRUE, TRUE)
            RETURNING id INTO v_group_id;
            
            -- Insert default settings for this new group
            INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, locale)
            VALUES (v_group_id, 'name', r.role, 'en_US');
        END IF;

        -- 3. Assign User to Group
        INSERT INTO user_user_groups (user_id, user_group_id)
        VALUES (r.user_id, v_group_id)
        ON CONFLICT (user_id, user_group_id) DO NOTHING;
        
    END LOOP;
END;
$$;
