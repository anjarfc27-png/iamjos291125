-- Migration: Row Level Security (RLS) Policies
-- Date: 2025-11-29
-- Description: Comprehensive RLS policies for multi-tenancy and security

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_user_groups ENABLE ROW LEVEL SECURITY;

-- Journal tables
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_settings ENABLE ROW LEVEL SECURITY;

-- Submission tables
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_galleys ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_galley_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE author_settings ENABLE ROW LEVEL SECURITY;

-- Review tables
ALTER TABLE review_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_assignment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_form_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_form_element_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_form_responses ENABLE ROW LEVEL SECURITY;

-- Workflow tables
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE edit_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_assignments ENABLE ROW LEVEL SECURITY;

-- Issue tables
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE issue_settings ENABLE ROW LEVEL SECURITY;

-- Content tables
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menu_item_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_settings ENABLE ROW LEVEL SECURITY;

-- Email & notification tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_template_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_subscription_settings ENABLE ROW LEVEL SECURITY;

-- File tables
ALTER TABLE library_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_file_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE genre_settings ENABLE ROW LEVEL SECURITY;

-- Activity tables
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE scheduled_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_settings ENABLE ROW LEVEL SECURITY;

-- Metadata tables
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE citation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlled_vocabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlled_vocab_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlled_vocab_entry_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_object_tombstones ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_object_tombstone_settings ENABLE ROW LEVEL SECURITY;

-- Payment tables
ALTER TABLE queued_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_payments ENABLE ROW LEVEL SECURITY;

-- Session tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if user is site admin
CREATE OR REPLACE FUNCTION is_site_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_account_roles
    WHERE user_id = auth.uid()
    AND role_path = 'admin'
    AND context_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has journal role
CREATE OR REPLACE FUNCTION has_journal_role(journal_id UUID, role_ids INTEGER[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_user_groups uug
    JOIN user_groups ug ON uug.user_group_id = ug.id
    WHERE uug.user_id = auth.uid()
    AND ug.context_id = journal_id
    AND ug.role_id = ANY(role_ids)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is assigned to submission
CREATE OR REPLACE FUNCTION is_assigned_to_submission(submission_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM stage_assignments
    WHERE submission_id = submission_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is submission author
CREATE OR REPLACE FUNCTION is_submission_author(submission_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM submissions s
    JOIN publications p ON s.current_publication_id = p.id
    JOIN authors a ON p.id = a.publication_id
    JOIN users u ON a.email = u.email
    WHERE s.id = submission_id
    AND u.id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- USER POLICIES
-- ============================================================================

-- Users: Site admins can see all, users can see themselves
CREATE POLICY "Users are viewable by site admins or self"
  ON users FOR SELECT
  USING (
    is_site_admin() OR id = auth.uid()
  );

CREATE POLICY "Users can update themselves"
  ON users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Site admins can insert users"
  ON users FOR INSERT
  WITH CHECK (is_site_admin());

CREATE POLICY "Site admins can delete users"
  ON users FOR DELETE
  USING (is_site_admin());

-- User Settings: Users can manage their own settings
CREATE POLICY "User settings are viewable by owner or site admin"
  ON user_settings FOR SELECT
  USING (
    is_site_admin() OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own settings"
  ON user_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- JOURNAL POLICIES
-- ============================================================================

-- Journals: Public read, admin write
CREATE POLICY "Journals are viewable by everyone"
  ON journals FOR SELECT
  USING (enabled = TRUE OR is_site_admin());

CREATE POLICY "Site admins can manage journals"
  ON journals FOR ALL
  USING (is_site_admin())
  WITH CHECK (is_site_admin());

-- Journal Settings: Public read for enabled journals
CREATE POLICY "Journal settings are viewable"
  ON journal_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journals j
      WHERE j.id = journal_id
      AND (j.enabled = TRUE OR is_site_admin())
    )
  );

CREATE POLICY "Journal managers can update settings"
  ON journal_settings FOR ALL
  USING (
    is_site_admin() OR
    has_journal_role(journal_id, ARRAY[16]) -- Manager role
  )
  WITH CHECK (
    is_site_admin() OR
    has_journal_role(journal_id, ARRAY[16])
  );

-- ============================================================================
-- SUBMISSION POLICIES
-- ============================================================================

-- Submissions: Visible to assigned users, authors, and admins
CREATE POLICY "Submissions are viewable by participants"
  ON submissions FOR SELECT
  USING (
    is_site_admin() OR
    has_journal_role(context_id, ARRAY[16, 17, 4096]) OR -- Manager, Editor, Reviewer
    is_assigned_to_submission(id) OR
    is_submission_author(id)
  );

CREATE POLICY "Authors can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (
    has_journal_role(context_id, ARRAY[65536]) -- Author role
  );

CREATE POLICY "Editors can update submissions"
  ON submissions FOR UPDATE
  USING (
    is_site_admin() OR
    has_journal_role(context_id, ARRAY[16, 17]) OR -- Manager, Editor
    is_assigned_to_submission(id)
  );

-- ============================================================================
-- REVIEW POLICIES
-- ============================================================================

-- Review Assignments: Reviewers can see their own assignments
CREATE POLICY "Review assignments are viewable by reviewer or editors"
  ON review_assignments FOR SELECT
  USING (
    is_site_admin() OR
    reviewer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id
      AND has_journal_role(s.context_id, ARRAY[16, 17])
    )
  );

CREATE POLICY "Editors can manage review assignments"
  ON review_assignments FOR ALL
  USING (
    is_site_admin() OR
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id
      AND has_journal_role(s.context_id, ARRAY[16, 17])
    )
  );

-- ============================================================================
-- NOTIFICATION POLICIES
-- ============================================================================

-- Notifications: Users can see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid() OR is_site_admin());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE); -- Allow system to create notifications

-- ============================================================================
-- FILE POLICIES
-- ============================================================================

-- Submission Files: Visible to submission participants
CREATE POLICY "Submission files are viewable by participants"
  ON submission_files FOR SELECT
  USING (
    is_site_admin() OR
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id
      AND (
        has_journal_role(s.context_id, ARRAY[16, 17, 4096]) OR
        is_assigned_to_submission(s.id) OR
        is_submission_author(s.id)
      )
    )
  );

CREATE POLICY "Participants can upload files"
  ON submission_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id
      AND (
        is_assigned_to_submission(s.id) OR
        is_submission_author(s.id)
      )
    )
  );

-- Temporary Files: Users can manage their own
CREATE POLICY "Users can manage their own temporary files"
  ON temporary_files FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- ADMIN-ONLY POLICIES
-- ============================================================================

-- System tables: Admin only
CREATE POLICY "Site admins can manage scheduled tasks"
  ON scheduled_tasks FOR ALL
  USING (is_site_admin())
  WITH CHECK (is_site_admin());

CREATE POLICY "Site admins can view event logs"
  ON event_log FOR SELECT
  USING (is_site_admin());

CREATE POLICY "Site admins can view email logs"
  ON email_log FOR SELECT
  USING (is_site_admin());

-- ============================================================================
-- PUBLIC READ POLICIES
-- ============================================================================

-- Published content is public
CREATE POLICY "Published publications are viewable by everyone"
  ON publications FOR SELECT
  USING (
    status = 3 OR -- STATUS_PUBLISHED
    is_site_admin() OR
    EXISTS (
      SELECT 1 FROM submissions s
      WHERE s.id = submission_id
      AND (
        has_journal_role(s.context_id, ARRAY[16, 17]) OR
        is_assigned_to_submission(s.id) OR
        is_submission_author(s.id)
      )
    )
  );

CREATE POLICY "Published issues are viewable by everyone"
  ON issues FOR SELECT
  USING (
    published = TRUE OR
    is_site_admin() OR
    has_journal_role(journal_id, ARRAY[16, 17])
  );

-- ============================================================================
-- BYPASS FOR SERVICE ROLE
-- ============================================================================

-- Allow service role to bypass RLS
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE journals FORCE ROW LEVEL SECURITY;
ALTER TABLE submissions FORCE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only access to anonymous users for public content
GRANT SELECT ON journals, publications, issues, publication_galleys TO anon;

COMMENT ON FUNCTION is_site_admin() IS 'Check if current user is a site administrator';
COMMENT ON FUNCTION has_journal_role(UUID, INTEGER[]) IS 'Check if current user has specific role in journal';
COMMENT ON FUNCTION is_assigned_to_submission(UUID) IS 'Check if current user is assigned to submission';
COMMENT ON FUNCTION is_submission_author(UUID) IS 'Check if current user is author of submission';
