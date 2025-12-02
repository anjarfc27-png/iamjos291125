-- OJS 3.3 Role and User Groups Data
-- Insert default roles and user groups based on OJS PKP original

-- Role constants (mimicking PHP constants)
-- ROLE_ID_SITE_ADMIN = 1
-- ROLE_ID_MANAGER = 16
-- ROLE_ID_SUB_EDITOR = 17
-- ROLE_ID_ASSISTANT = 4097
-- ROLE_ID_AUTHOR = 65536
-- ROLE_ID_REVIEWER = 4096
-- ROLE_ID_READER = 1048576
-- ROLE_ID_SUBSCRIPTION_MANAGER = 2097152

-- Insert default journal
INSERT INTO journals (id, path, enabled, primary_locale, seq) VALUES
(gen_random_uuid(), 'default-journal', true, 'en_US', 1);

-- User Groups for Site Admin (site-level, not journal-specific)
-- Site Admin role is handled at application level, not in user_groups table

-- User Groups for Managerial Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 16, true, true, false, true, false FROM journal j;

-- User Groups for Sub Editor Roles  
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 17, true, true, false, true, true FROM journal j;

-- User Groups for Assistant Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 4097, true, true, false, true, false FROM journal j;

-- User Groups for Author Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 65536, true, true, true, true, false FROM journal j;

-- User Groups for Reviewer Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 4096, true, false, true, false, false FROM journal j;

-- User Groups for Reader Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 1048576, true, false, true, false, false FROM journal j;

-- User Groups for Subscription Manager Roles
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO user_groups (context_id, role_id, is_default, show_title, permit_self_registration, permit_metadata_edit, recommend_only) 
SELECT j.id, 2097152, true, true, false, true, false FROM journal j;

-- Insert user group settings with proper names
-- Manager settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Journal Manager', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 16;

-- Sub Editor settings  
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Section Editor', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 17;

-- Assistant settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Assistant', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 4097;

-- Author settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Author', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 65536;

-- Reviewer settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Reviewer', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 4096;

-- Reader settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Reader', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 1048576;

-- Subscription Manager settings
INSERT INTO user_group_settings (user_group_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 'Subscription Manager', 'string', 'en_US' FROM user_groups g WHERE g.role_id = 2097152;

-- Insert default genres (file types)
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO genres (context_id, seq, enabled, category, dependent, supplementary, entry_key) 
SELECT j.id, 1, true, 1, false, false, 'SUBMISSION' FROM journal j UNION ALL
SELECT j.id, 2, true, 1, false, false, 'RESEARCHINSTRUMENT' FROM journal j UNION ALL
SELECT j.id, 3, true, 1, false, false, 'DATASET' FROM journal j UNION ALL
SELECT j.id, 4, true, 1, false, false, 'SOURCE' FROM journal j UNION ALL
SELECT j.id, 5, true, 1, false, false, 'RESEARCHMATERIALS' FROM journal j UNION ALL
SELECT j.id, 6, true, 1, false, false, 'DATAANALYSIS' FROM journal j UNION ALL
SELECT j.id, 7, true, 1, false, false, 'FIGURES' FROM journal j UNION ALL
SELECT j.id, 8, true, 1, false, false, 'TABLE' FROM journal j UNION ALL
SELECT j.id, 9, true, 1, false, false, 'MULTIMEDIA' FROM journal j UNION ALL
SELECT j.id, 10, true, 1, false, false, 'HYPOTHESIS' FROM journal j UNION ALL
SELECT j.id, 11, true, 1, false, false, 'METHODS' FROM journal j UNION ALL
SELECT j.id, 12, true, 1, false, false, 'PROTOCOLS' FROM journal j UNION ALL
SELECT j.id, 13, true, 1, false, false, 'STATEMENT' FROM journal j UNION ALL
SELECT j.id, 14, true, 1, false, false, 'OTHER' FROM journal j;

-- Insert genre settings
INSERT INTO genre_settings (genre_id, setting_name, setting_value, setting_type, locale) 
SELECT g.id, 'name', 
CASE 
    WHEN g.entry_key = 'SUBMISSION' THEN 'Article Text'
    WHEN g.entry_key = 'RESEARCHINSTRUMENT' THEN 'Research Instrument'
    WHEN g.entry_key = 'DATASET' THEN 'Data Set'
    WHEN g.entry_key = 'SOURCE' THEN 'Source Text'
    WHEN g.entry_key = 'RESEARCHMATERIALS' THEN 'Research Materials'
    WHEN g.entry_key = 'DATAANALYSIS' THEN 'Data Analysis'
    WHEN g.entry_key = 'FIGURES' THEN 'Figure'
    WHEN g.entry_key = 'TABLE' THEN 'Table'
    WHEN g.entry_key = 'MULTIMEDIA' THEN 'Multimedia'
    WHEN g.entry_key = 'HYPOTHESIS' THEN 'Hypothesis'
    WHEN g.entry_key = 'METHODS' THEN 'Methods'
    WHEN g.entry_key = 'PROTOCOLS' THEN 'Protocols'
    WHEN g.entry_key = 'STATEMENT' THEN 'Statement'
    ELSE 'Other'
END, 'string', 'en_US'
FROM genres g;