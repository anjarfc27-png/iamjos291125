-- Migration: Add user_group_stage and stage_assignments tables
-- These tables are required for OJS PKP 3.3 compliant role assignment system
-- Based on ojs_php_asli_3.3/lib/pkp/xml/schema/rolesAndUserGroups.xml

-- User Group Stage Assignment Table
-- Determines which workflow stages a user group is active in
CREATE TABLE IF NOT EXISTS user_group_stage (
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (context_id, user_group_id, stage_id)
);

-- Create indexes for user_group_stage
CREATE INDEX IF NOT EXISTS user_group_stage_context_id_idx ON user_group_stage(context_id);
CREATE INDEX IF NOT EXISTS user_group_stage_user_group_id_idx ON user_group_stage(user_group_id);
CREATE INDEX IF NOT EXISTS user_group_stage_stage_id_idx ON user_group_stage(stage_id);

-- Stage Assignments Table
-- Specific assignments of users to submissions at workflow stages
CREATE TABLE IF NOT EXISTS stage_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_assigned TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recommend_only BOOLEAN DEFAULT FALSE,
    can_change_metadata BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, user_group_id, user_id)
);

-- Create indexes for stage_assignments
CREATE INDEX IF NOT EXISTS stage_assignments_submission_id_idx ON stage_assignments(submission_id);
CREATE INDEX IF NOT EXISTS stage_assignments_user_group_id_idx ON stage_assignments(user_group_id);
CREATE INDEX IF NOT EXISTS stage_assignments_user_id_idx ON stage_assignments(user_id);

-- Add comment for documentation
COMMENT ON TABLE user_group_stage IS 'User groups assignments to stages in the workflow';
COMMENT ON TABLE stage_assignments IS 'Stage Assignments - specific user assignments to submissions at workflow stages';





