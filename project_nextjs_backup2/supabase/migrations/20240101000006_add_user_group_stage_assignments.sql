-- Migration: Add default user_group_stage assignments based on OJS PKP 3.3
-- Based on ojs_php_asli_3.3/registry/userGroups.xml
-- Workflow stages: Submission=1, Internal Review=2, External Review=3, Copyediting=4, Production=5

-- Manager role (role_id=16) - Editor group with stages 1,3,4,5
INSERT INTO user_group_stage (context_id, user_group_id, stage_id)
SELECT ug.context_id, ug.id, stage_id
FROM user_groups ug
CROSS JOIN unnest(ARRAY[1, 3, 4, 5]) AS stage_id
WHERE ug.role_id = 16
ON CONFLICT (context_id, user_group_id, stage_id) DO NOTHING;

-- Section Editor role (role_id=17) - stages 1,3,4,5
INSERT INTO user_group_stage (context_id, user_group_id, stage_id)
SELECT ug.context_id, ug.id, stage_id
FROM user_groups ug
CROSS JOIN unnest(ARRAY[1, 3, 4, 5]) AS stage_id
WHERE ug.role_id = 17
ON CONFLICT (context_id, user_group_id, stage_id) DO NOTHING;

-- Assistant role (role_id=4097) - Copyeditor stages 4
INSERT INTO user_group_stage (context_id, user_group_id, stage_id)
SELECT ug.context_id, ug.id, 4
FROM user_groups ug
WHERE ug.role_id = 4097
ON CONFLICT (context_id, user_group_id, stage_id) DO NOTHING;

-- Author role (role_id=65536) - stages 1,3,4,5
INSERT INTO user_group_stage (context_id, user_group_id, stage_id)
SELECT ug.context_id, ug.id, stage_id
FROM user_groups ug
CROSS JOIN unnest(ARRAY[1, 3, 4, 5]) AS stage_id
WHERE ug.role_id = 65536
ON CONFLICT (context_id, user_group_id, stage_id) DO NOTHING;

-- Reviewer role (role_id=4096) - stage 3 (External Review)
INSERT INTO user_group_stage (context_id, user_group_id, stage_id)
SELECT ug.context_id, ug.id, 3
FROM user_groups ug
WHERE ug.role_id = 4096
ON CONFLICT (context_id, user_group_id, stage_id) DO NOTHING;

-- Reader role (role_id=1048576) - no stages (empty stages="")
-- Subscription Manager role (role_id=2097152) - no stages (empty stages="")





