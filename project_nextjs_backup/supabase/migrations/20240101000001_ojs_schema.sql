-- OJS 3.3 Database Schema Migration
-- Comprehensive database structure for Open Journal Systems

-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(90) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(40) NOT NULL,
    initials VARCHAR(5),
    salutation VARCHAR(40),
    suffix VARCHAR(40),
    country VARCHAR(90),
    phone VARCHAR(24),
    mailing_address TEXT,
    billing_address TEXT,
    must_change_password BOOLEAN DEFAULT FALSE,
    auth_id BIGINT,
    auth_string TEXT,
    disabled BOOLEAN DEFAULT FALSE,
    date_last_login TIMESTAMPTZ,
    date_registered TIMESTAMPTZ DEFAULT NOW(),
    date_validated TIMESTAMPTZ,
    date_last_email TIMESTAMPTZ,
    inline_help BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings
CREATE TABLE user_settings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (user_id, setting_name, locale)
);

-- Journals/Contexts
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(32) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    primary_locale VARCHAR(5) DEFAULT 'en_US',
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Settings
CREATE TABLE journal_settings (
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (journal_id, setting_name, locale)
);

-- User Groups (Roles)
CREATE TABLE user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    show_title BOOLEAN DEFAULT FALSE,
    permit_self_registration BOOLEAN DEFAULT FALSE,
    permit_metadata_edit BOOLEAN DEFAULT FALSE,
    recommend_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Group Settings
CREATE TABLE user_group_settings (
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (user_group_id, setting_name, locale)
);

-- User User Group Assignments
CREATE TABLE user_user_groups (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, user_group_id)
);

-- Submissions (Articles)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL DEFAULT 1,
    status INTEGER NOT NULL DEFAULT 1,
    current_publication_id UUID,
    date_submitted TIMESTAMPTZ,
    date_last_activity TIMESTAMPTZ,
    date_status_modified TIMESTAMPTZ,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publications (Versions)
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    status INTEGER DEFAULT 1,
    primary_locale VARCHAR(5) DEFAULT 'en_US',
    date_published TIMESTAMPTZ,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Publication Settings
CREATE TABLE publication_settings (
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (publication_id, setting_name, locale)
);

-- Submission Files
CREATE TABLE submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_stage INTEGER NOT NULL,
    genre_id UUID,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    original_file_name VARCHAR(255),
    uploader_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Rounds
CREATE TABLE review_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    round INTEGER NOT NULL DEFAULT 1,
    status INTEGER DEFAULT 1,
    date_status_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, stage_id, round)
);

-- Review Assignments
CREATE TABLE review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    review_round_id UUID NOT NULL REFERENCES review_rounds(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    status INTEGER DEFAULT 0,
    date_assigned TIMESTAMPTZ DEFAULT NOW(),
    date_notified TIMESTAMPTZ,
    date_confirmed TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    date_due TIMESTAMPTZ,
    date_response_due TIMESTAMPTZ,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    reminder_was_automatic INTEGER DEFAULT 0,
    declined INTEGER DEFAULT 0,
    cancelled INTEGER DEFAULT 0,
    quality INTEGER,
    recommendation INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Assignment Settings
CREATE TABLE review_assignment_settings (
    review_assignment_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (review_assignment_id, setting_name)
);

-- Review Forms
CREATE TABLE review_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER,
    assoc_id UUID,
    seq INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Form Settings
CREATE TABLE review_form_settings (
    review_form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (review_form_id, setting_name, locale)
);

-- Review Form Elements
CREATE TABLE review_form_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    element_type INTEGER NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    included BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Form Element Settings
CREATE TABLE review_form_element_settings (
    review_form_element_id UUID NOT NULL REFERENCES review_form_elements(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (review_form_element_id, setting_name, locale)
);

-- Review Form Responses
CREATE TABLE review_form_responses (
    review_form_element_id UUID NOT NULL REFERENCES review_form_elements(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    response_type VARCHAR(6) DEFAULT 'string',
    response_value TEXT,
    PRIMARY KEY (review_form_element_id, review_id)
);

-- Comments/Notes
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER NOT NULL,
    assoc_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW(),
    title VARCHAR(255),
    contents TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issues
CREATE TABLE issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    volume INTEGER DEFAULT 0,
    number VARCHAR(10) DEFAULT '0',
    year INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT FALSE,
    date_published TIMESTAMPTZ,
    date_notified TIMESTAMPTZ,
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    access_status INTEGER DEFAULT 0,
    open_access_date TIMESTAMPTZ,
    show_volume BOOLEAN DEFAULT FALSE,
    show_number BOOLEAN DEFAULT FALSE,
    show_year BOOLEAN DEFAULT FALSE,
    show_title BOOLEAN DEFAULT FALSE,
    style_file_name VARCHAR(90),
    original_style_file_name VARCHAR(255),
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Issue Settings
CREATE TABLE issue_settings (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (issue_id, setting_name, locale)
);

-- Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    editor_restricted BOOLEAN DEFAULT FALSE,
    meta_indexed BOOLEAN DEFAULT TRUE,
    meta_reviewed BOOLEAN DEFAULT TRUE,
    abstracts_not_required BOOLEAN DEFAULT FALSE,
    hide_title BOOLEAN DEFAULT FALSE,
    hide_author BOOLEAN DEFAULT FALSE,
    is_inactive BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Section Settings
CREATE TABLE section_settings (
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (section_id, setting_name, locale)
);

-- Genres
CREATE TABLE genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT TRUE,
    category INTEGER DEFAULT 1,
    dependent BOOLEAN DEFAULT FALSE,
    supplementary BOOLEAN DEFAULT FALSE,
    entry_key VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Genre Settings
CREATE TABLE genre_settings (
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (genre_id, setting_name, locale)
);

-- Navigation Menus
CREATE TABLE navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    menu_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation Menu Items
CREATE TABLE navigation_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    navigation_menu_id UUID NOT NULL REFERENCES navigation_menus(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    menu_item_type VARCHAR(255) NOT NULL,
    seq INTEGER DEFAULT 0,
    parent_id UUID REFERENCES navigation_menu_items(id) ON DELETE CASCADE,
    path VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation Menu Item Settings
CREATE TABLE navigation_menu_item_settings (
    navigation_menu_item_id UUID NOT NULL REFERENCES navigation_menu_items(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (navigation_menu_item_id, setting_name, locale)
);

-- Library Files
CREATE TABLE library_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    original_file_name VARCHAR(255),
    file_stage INTEGER NOT NULL,
    genre_id UUID REFERENCES genres(id) ON DELETE SET NULL,
    uploader_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library File Settings
CREATE TABLE library_file_settings (
    library_file_id UUID NOT NULL REFERENCES library_files(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (library_file_id, setting_name, locale)
);

-- Announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER,
    assoc_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    description_short TEXT,
    type_id UUID,
    date_expire TIMESTAMPTZ,
    date_posted TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement Settings
CREATE TABLE announcement_settings (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (announcement_id, setting_name, locale)
);

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    email_key VARCHAR(255) NOT NULL,
    can_disable BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT TRUE,
    from_role_id BIGINT,
    to_role_id BIGINT,
    stage_id INTEGER,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Template Settings
CREATE TABLE email_template_settings (
    email_template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(5) DEFAULT '',
    PRIMARY KEY (email_template_id, setting_name, locale)
);

-- Access Keys
CREATE TABLE access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context VARCHAR(40) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assoc_id UUID,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queued Payments
CREATE TABLE queued_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMPTZ DEFAULT NOW(),
    date_modified TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    payment_data TEXT NOT NULL
);

-- Completed Payments
CREATE TABLE completed_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assoc_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    payment_method_plugin_name VARCHAR(80),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_context ON submissions(context_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_stage ON submissions(stage_id);
CREATE INDEX idx_publications_submission ON publications(submission_id);
CREATE INDEX idx_review_assignments_submission ON review_assignments(submission_id);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_user_user_groups_user ON user_user_groups(user_id);
CREATE INDEX idx_user_user_groups_group ON user_user_groups(user_group_id);
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_journal_settings_journal ON journal_settings(journal_id);
CREATE INDEX idx_submission_files_submission ON submission_files(submission_id);
CREATE INDEX idx_notes_assoc ON notes(assoc_type, assoc_id);
CREATE INDEX idx_issues_journal ON issues(journal_id);
CREATE INDEX idx_sections_journal ON sections(journal_id);
CREATE INDEX idx_genres_context ON genres(context_id);
CREATE INDEX idx_navigation_menus_context ON navigation_menus(context_id);
CREATE INDEX idx_announcements_assoc ON announcements(assoc_type, assoc_id);
CREATE INDEX idx_email_templates_context ON email_templates(context_id);
CREATE INDEX idx_completed_payments_context ON completed_payments(context_id);
CREATE INDEX idx_completed_payments_user ON completed_payments(user_id);