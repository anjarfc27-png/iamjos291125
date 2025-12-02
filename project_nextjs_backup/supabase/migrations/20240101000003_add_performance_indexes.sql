-- Migration: Add Performance Indexes
-- Date: 2025-11-29
-- Description: Add additional indexes for optimal query performance matching OJS 3.3

-- ============================================================================
-- REVIEW ROUNDS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_review_rounds_submission_stage ON review_rounds(submission_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_review_rounds_status ON review_rounds(status);

-- ============================================================================
-- STAGE ASSIGNMENTS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_stage_assignments_submission_user ON stage_assignments(submission_id, user_id);
CREATE INDEX IF NOT EXISTS idx_stage_assignments_user_group_user ON stage_assignments(user_group_id, user_id);

-- ============================================================================
-- QUERIES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_queries_closed ON queries(closed);
CREATE INDEX IF NOT EXISTS idx_queries_date_posted ON queries(date_posted);

-- ============================================================================
-- EDIT DECISIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_edit_decisions_submission_stage ON edit_decisions(submission_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_edit_decisions_decision ON edit_decisions(decision);
CREATE INDEX IF NOT EXISTS idx_edit_decisions_date ON edit_decisions(date_decided);

-- ============================================================================
-- AUTHORS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);
CREATE INDEX IF NOT EXISTS idx_authors_publication_seq ON authors(publication_id, seq);

-- ============================================================================
-- PUBLICATIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_publications_status ON publications(status);
CREATE INDEX IF NOT EXISTS idx_publications_date_published ON publications(date_published);
CREATE INDEX IF NOT EXISTS idx_publications_submission_version ON publications(submission_id, version);

-- ============================================================================
-- SUBMISSION FILES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_submission_files_stage ON submission_files(file_stage);
CREATE INDEX IF NOT EXISTS idx_submission_files_uploader ON submission_files(uploader_user_id);
CREATE INDEX IF NOT EXISTS idx_submission_files_genre ON submission_files(genre_id);

-- ============================================================================
-- PUBLICATION GALLEYS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_publication_galleys_file ON publication_galleys(file_id);
CREATE INDEX IF NOT EXISTS idx_publication_galleys_approved ON publication_galleys(is_approved);

-- ============================================================================
-- ISSUES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_issues_published ON issues(published);
CREATE INDEX IF NOT EXISTS idx_issues_date_published ON issues(date_published);
CREATE INDEX IF NOT EXISTS idx_issues_journal_published ON issues(journal_id, published);

-- ============================================================================
-- SECTIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sections_inactive ON sections(is_inactive);
CREATE INDEX IF NOT EXISTS idx_sections_journal_seq ON sections(journal_id, seq);

-- ============================================================================
-- NOTIFICATIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_date_read ON notifications(date_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, date_read) WHERE date_read IS NULL;

-- ============================================================================
-- EVENT LOG INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_event_log_date ON event_log(date_logged);
CREATE INDEX IF NOT EXISTS idx_event_log_event_type ON event_log(event_type);

-- ============================================================================
-- EMAIL LOG INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_email_log_date ON email_log(date_sent);
CREATE INDEX IF NOT EXISTS idx_email_log_event_type ON email_log(event_type);

-- ============================================================================
-- CITATIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_citations_publication_seq ON citations(publication_id, seq);

-- ============================================================================
-- CONTROLLED VOCABS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_controlled_vocab_entries_vocab ON controlled_vocab_entries(controlled_vocab_id);
CREATE INDEX IF NOT EXISTS idx_controlled_vocab_entries_seq ON controlled_vocab_entries(controlled_vocab_id, seq);

-- ============================================================================
-- TEMPORARY FILES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_temporary_files_date ON temporary_files(date_uploaded);

-- ============================================================================
-- NAVIGATION MENU ITEMS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_navigation_menu_items_parent ON navigation_menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_navigation_menu_items_menu_seq ON navigation_menu_items(navigation_menu_id, seq);

-- ============================================================================
-- LIBRARY FILES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_library_files_submission ON library_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_library_files_uploader ON library_files(uploader_user_id);

-- ============================================================================
-- SESSIONS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================================================
-- USER GROUPS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_groups_role_id ON user_groups(role_id);
CREATE INDEX IF NOT EXISTS idx_user_groups_context_role ON user_groups(context_id, role_id);

-- ============================================================================
-- GENRES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_genres_enabled ON genres(enabled);
CREATE INDEX IF NOT EXISTS idx_genres_context_seq ON genres(context_id, seq);

-- ============================================================================
-- ANNOUNCEMENTS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_announcements_date_posted ON announcements(date_posted);
CREATE INDEX IF NOT EXISTS idx_announcements_date_expire ON announcements(date_expire);

-- ============================================================================
-- EMAIL TEMPLATES INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(email_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_context_key ON email_templates(context_id, email_key);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Submission workflow queries
CREATE INDEX IF NOT EXISTS idx_submissions_context_status_stage ON submissions(context_id, status, stage_id);
CREATE INDEX IF NOT EXISTS idx_submissions_date_activity ON submissions(date_last_activity);

-- Review assignment queries
CREATE INDEX IF NOT EXISTS idx_review_assignments_reviewer_status ON review_assignments(reviewer_id, status);
CREATE INDEX IF NOT EXISTS idx_review_assignments_submission_status ON review_assignments(submission_id, status);

-- User role queries
CREATE INDEX IF NOT EXISTS idx_user_user_groups_user_group ON user_user_groups(user_id, user_group_id);

-- Settings queries (for faster EAV lookups)
CREATE INDEX IF NOT EXISTS idx_user_settings_name ON user_settings(setting_name);
CREATE INDEX IF NOT EXISTS idx_journal_settings_name ON journal_settings(setting_name);
CREATE INDEX IF NOT EXISTS idx_publication_settings_name ON publication_settings(setting_name);

-- ============================================================================
-- FULL TEXT SEARCH INDEXES (for PostgreSQL)
-- ============================================================================

-- Add GIN indexes for text search on common fields
CREATE INDEX IF NOT EXISTS idx_users_fulltext ON users USING GIN (
    to_tsvector('english', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(email, '')
    )
);

CREATE INDEX IF NOT EXISTS idx_publications_fulltext ON publication_settings USING GIN (
    to_tsvector('english', COALESCE(setting_value, ''))
) WHERE setting_name IN ('title', 'abstract');

-- ============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- ============================================================================

-- Active submissions only
CREATE INDEX IF NOT EXISTS idx_submissions_active ON submissions(context_id, stage_id) 
WHERE status IN (1, 3); -- STATUS_QUEUED, STATUS_PUBLISHED

-- Enabled journals only
CREATE INDEX IF NOT EXISTS idx_journals_enabled ON journals(path) WHERE enabled = TRUE;

-- Unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, date_created) 
WHERE date_read IS NULL;

-- Active review assignments
CREATE INDEX IF NOT EXISTS idx_review_assignments_active ON review_assignments(reviewer_id, submission_id) 
WHERE status IN (0, 1, 4, 5, 6); -- Active statuses

-- Published issues
CREATE INDEX IF NOT EXISTS idx_issues_published_journal ON issues(journal_id, date_published) 
WHERE published = TRUE;

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

ANALYZE users;
ANALYZE journals;
ANALYZE submissions;
ANALYZE publications;
ANALYZE review_assignments;
ANALYZE user_groups;
ANALYZE user_user_groups;
ANALYZE stage_assignments;
ANALYZE edit_decisions;
ANALYZE queries;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_submissions_context_status_stage IS 'Optimizes submission list queries by context, status, and stage';
COMMENT ON INDEX idx_review_assignments_reviewer_status IS 'Optimizes reviewer dashboard queries';
COMMENT ON INDEX idx_notifications_unread IS 'Optimizes unread notification queries';
COMMENT ON INDEX idx_users_fulltext IS 'Enables full-text search on user names and emails';
COMMENT ON INDEX idx_publications_fulltext IS 'Enables full-text search on publication titles and abstracts';
