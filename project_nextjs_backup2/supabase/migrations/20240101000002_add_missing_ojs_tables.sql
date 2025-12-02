-- Migration: Add Missing OJS 3.3 Tables
-- Date: 2025-11-29
-- Description: Add queries, edit_decisions, stage_assignments, and other missing tables

-- ============================================================================
-- QUERIES & DISCUSSIONS
-- ============================================================================

-- Queries (Discussion threads)
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER NOT NULL,
    assoc_id UUID NOT NULL,
    stage_id INTEGER NOT NULL,
    seq FLOAT DEFAULT 0,
    date_posted TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW(),
    closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queries_assoc ON queries(assoc_type, assoc_id);
CREATE INDEX idx_queries_stage ON queries(stage_id);

-- Query Participants
CREATE TABLE IF NOT EXISTS query_participants (
    query_id UUID NOT NULL REFERENCES queries(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (query_id, user_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_query_participants_query ON query_participants(query_id);
CREATE INDEX idx_query_participants_user ON query_participants(user_id);

-- ============================================================================
-- EDITORIAL DECISIONS
-- ============================================================================

-- Edit Decisions (Editor decisions on submissions)
CREATE TABLE IF NOT EXISTS edit_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    review_round_id UUID REFERENCES review_rounds(id) ON DELETE SET NULL,
    stage_id INTEGER NOT NULL,
    round INTEGER DEFAULT 1,
    editor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    decision INTEGER NOT NULL,
    date_decided TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edit_decisions_submission ON edit_decisions(submission_id);
CREATE INDEX idx_edit_decisions_editor ON edit_decisions(editor_id);
CREATE INDEX idx_edit_decisions_review_round ON edit_decisions(review_round_id);

-- ============================================================================
-- STAGE ASSIGNMENTS
-- ============================================================================

-- Stage Assignments (Participant assignments to submission stages)
CREATE TABLE IF NOT EXISTS stage_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_assigned TIMESTAMPTZ DEFAULT NOW(),
    recommend_only BOOLEAN DEFAULT FALSE,
    can_change_metadata BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stage_assignments_submission ON stage_assignments(submission_id);
CREATE INDEX idx_stage_assignments_user ON stage_assignments(user_id);
CREATE INDEX idx_stage_assignments_user_group ON stage_assignments(user_group_id);

-- ============================================================================
-- PUBLICATION GALLEYS
-- ============================================================================

-- Publication Galleys (Article file representations)
CREATE TABLE IF NOT EXISTS publication_galleys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locale VARCHAR(5),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    label VARCHAR(255),
    file_id UUID REFERENCES submission_files(id) ON DELETE SET NULL,
    seq FLOAT DEFAULT 0,
    remote_url VARCHAR(2047),
    is_approved BOOLEAN DEFAULT FALSE,
    url_path VARCHAR(64),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_publication_galleys_publication ON publication_galleys(publication_id);
CREATE INDEX idx_publication_galleys_url_path ON publication_galleys(url_path);

-- Publication Galley Settings
CREATE TABLE IF NOT EXISTS publication_galley_settings (
    galley_id UUID NOT NULL REFERENCES publication_galleys(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (galley_id, locale, setting_name)
);

CREATE INDEX idx_publication_galley_settings_galley ON publication_galley_settings(galley_id);

-- ============================================================================
-- AUTHORS & CONTRIBUTORS
-- ============================================================================

-- Authors (Publication contributors)
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(90) NOT NULL,
    include_in_browse BOOLEAN DEFAULT TRUE,
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    seq FLOAT DEFAULT 0,
    user_group_id UUID REFERENCES user_groups(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_authors_publication ON authors(publication_id);

-- Author Settings
CREATE TABLE IF NOT EXISTS author_settings (
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (author_id, locale, setting_name)
);

CREATE INDEX idx_author_settings_author ON author_settings(author_id);

-- ============================================================================
-- SUBMISSION ACTIVITY LOG
-- ============================================================================

-- Event Log (Activity tracking)
CREATE TABLE IF NOT EXISTS event_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER NOT NULL,
    assoc_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date_logged TIMESTAMPTZ DEFAULT NOW(),
    event_type INTEGER,
    message TEXT,
    is_translate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_event_log_assoc ON event_log(assoc_type, assoc_id);
CREATE INDEX idx_event_log_user ON event_log(user_id);

-- Event Log Settings
CREATE TABLE IF NOT EXISTS event_log_settings (
    log_id UUID NOT NULL REFERENCES event_log(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (log_id, setting_name)
);

-- ============================================================================
-- EMAIL LOG
-- ============================================================================

-- Email Log (Sent emails tracking)
CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER,
    assoc_id UUID,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date_sent TIMESTAMPTZ DEFAULT NOW(),
    event_type INTEGER,
    from_address VARCHAR(255),
    recipients TEXT,
    cc_recipients TEXT,
    bcc_recipients TEXT,
    subject VARCHAR(255),
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_log_assoc ON email_log(assoc_type, assoc_id);
CREATE INDEX idx_email_log_sender ON email_log(sender_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_read TIMESTAMPTZ,
    type INTEGER NOT NULL,
    assoc_type INTEGER,
    assoc_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_context ON notifications(context_id);
CREATE INDEX idx_notifications_assoc ON notifications(assoc_type, assoc_id);

-- Notification Settings
CREATE TABLE IF NOT EXISTS notification_settings (
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (notification_id, locale, setting_name)
);

-- Notification Subscription Settings
CREATE TABLE IF NOT EXISTS notification_subscription_settings (
    setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    setting_type VARCHAR(6) DEFAULT 'string',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_subscription_settings_user ON notification_subscription_settings(user_id);
CREATE INDEX idx_notification_subscription_settings_context ON notification_subscription_settings(context_id);

-- ============================================================================
-- SCHEDULED TASKS
-- ============================================================================

-- Scheduled Tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name VARCHAR(255) NOT NULL UNIQUE,
    last_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FILTERS & FILTER GROUPS
-- ============================================================================

-- Filters
CREATE TABLE IF NOT EXISTS filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filter_group_id UUID NOT NULL,
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    class_name VARCHAR(255),
    is_template BOOLEAN DEFAULT FALSE,
    parent_filter_id UUID REFERENCES filters(id) ON DELETE SET NULL,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_filters_filter_group ON filters(filter_group_id);
CREATE INDEX idx_filters_context ON filters(context_id);

-- Filter Groups
CREATE TABLE IF NOT EXISTS filter_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbolic VARCHAR(255) UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    input_type VARCHAR(255),
    output_type VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Filter Settings
CREATE TABLE IF NOT EXISTS filter_settings (
    filter_id UUID NOT NULL REFERENCES filters(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (filter_id, locale, setting_name)
);

-- ============================================================================
-- CITATIONS
-- ============================================================================

-- Citations
CREATE TABLE IF NOT EXISTS citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    raw_citation TEXT,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_citations_publication ON citations(publication_id);

-- Citation Settings
CREATE TABLE IF NOT EXISTS citation_settings (
    citation_id UUID NOT NULL REFERENCES citations(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (citation_id, locale, setting_name)
);

-- ============================================================================
-- DATA OBJECT TOMBSTONES
-- ============================================================================

-- Data Object Tombstones (For deleted/unpublished items)
CREATE TABLE IF NOT EXISTS data_object_tombstones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_object_id UUID NOT NULL,
    date_deleted TIMESTAMPTZ NOT NULL,
    set_spec VARCHAR(255) NOT NULL,
    set_name VARCHAR(255) NOT NULL,
    oai_identifier VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_data_object_tombstones_data_object ON data_object_tombstones(data_object_id);

-- Data Object Tombstone Settings
CREATE TABLE IF NOT EXISTS data_object_tombstone_settings (
    tombstone_id UUID NOT NULL REFERENCES data_object_tombstones(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (tombstone_id, locale, setting_name)
);

-- ============================================================================
-- TEMPORARY FILES
-- ============================================================================

-- Temporary Files
CREATE TABLE IF NOT EXISTS temporary_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(90) NOT NULL,
    file_type VARCHAR(255),
    file_size BIGINT NOT NULL,
    original_file_name VARCHAR(127),
    date_uploaded TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_temporary_files_user ON temporary_files(user_id);

-- ============================================================================
-- CONTROLLED VOCABULARIES
-- ============================================================================

-- Controlled Vocab Entries
CREATE TABLE IF NOT EXISTS controlled_vocab_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    controlled_vocab_id UUID NOT NULL,
    seq FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Controlled Vocabs
CREATE TABLE IF NOT EXISTS controlled_vocabs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbolic VARCHAR(64) NOT NULL,
    assoc_type INTEGER NOT NULL,
    assoc_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_controlled_vocabs_symbolic ON controlled_vocabs(symbolic, assoc_type, assoc_id);

-- Controlled Vocab Entry Settings
CREATE TABLE IF NOT EXISTS controlled_vocab_entry_settings (
    controlled_vocab_entry_id UUID NOT NULL REFERENCES controlled_vocab_entries(id) ON DELETE CASCADE,
    locale VARCHAR(5) DEFAULT '',
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (controlled_vocab_entry_id, locale, setting_name)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

ALTER TABLE notes ADD COLUMN IF NOT EXISTS note_type INTEGER;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS file_id UUID REFERENCES submission_files(id) ON DELETE SET NULL;

COMMENT ON TABLE queries IS 'Discussion threads between editors, authors, and reviewers';
COMMENT ON TABLE edit_decisions IS 'Editorial decisions made on submissions';
COMMENT ON TABLE stage_assignments IS 'User assignments to submission workflow stages';
COMMENT ON TABLE publication_galleys IS 'Published article file representations (PDF, HTML, etc.)';
COMMENT ON TABLE authors IS 'Publication contributors/authors';
COMMENT ON TABLE event_log IS 'Activity log for submissions and other objects';
COMMENT ON TABLE email_log IS 'Log of all emails sent by the system';
COMMENT ON TABLE notifications IS 'User notifications';
COMMENT ON TABLE scheduled_tasks IS 'Scheduled background tasks';
COMMENT ON TABLE citations IS 'Publication citations/references';
COMMENT ON TABLE data_object_tombstones IS 'Tombstones for deleted or unpublished items';
COMMENT ON TABLE temporary_files IS 'Temporary uploaded files';
COMMENT ON TABLE controlled_vocabs IS 'Controlled vocabularies for keywords, subjects, etc.';
