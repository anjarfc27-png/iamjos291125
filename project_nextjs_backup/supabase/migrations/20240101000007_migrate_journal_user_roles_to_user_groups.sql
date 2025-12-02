-- Migration: Migrate data from journal_user_roles to user_user_groups system
-- This migration maps role strings to role_ids and creates user_user_groups entries

-- Mapping role string to role_id based on OJS PKP 3.3
-- manager -> 16, section_editor -> 17, reviewer -> 4096, author -> 65536, etc.

-- Migrate journal_user_roles to user_user_groups
INSERT INTO user_user_groups (user_id, user_group_id)
SELECT DISTINCT
    jur.user_id,
    ug.id AS user_group_id
FROM journal_user_roles jur
INNER JOIN journals j ON j.id = jur.journal_id
INNER JOIN user_groups ug ON ug.context_id = j.id
INNER JOIN (
    SELECT 'manager' AS role_string, 16 AS role_id
    UNION ALL SELECT 'editor', 16
    UNION ALL SELECT 'section_editor', 17
    UNION ALL SELECT 'guest_editor', 17
    UNION ALL SELECT 'reviewer', 4096
    UNION ALL SELECT 'author', 65536
    UNION ALL SELECT 'reader', 1048576
    UNION ALL SELECT 'copyeditor', 4097
    UNION ALL SELECT 'proofreader', 4097
    UNION ALL SELECT 'layout-editor', 4097
) role_map ON role_map.role_string = jur.role AND role_map.role_id = ug.role_id
WHERE NOT EXISTS (
    SELECT 1 FROM user_user_groups uug 
    WHERE uug.user_id = jur.user_id 
    AND uug.user_group_id = ug.id
)
ON CONFLICT (user_id, user_group_id) DO NOTHING;

-- Note: This migration assumes user_groups already exist for each journal
-- If user_groups don't exist, they should be created first via setup-journal route





