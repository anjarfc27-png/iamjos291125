-- OJS 3.3 Database Schema for Next.js Implementation
-- This schema is based on the original OJS 3.3 PHP system but adapted for PostgreSQL

-- Users table (core user accounts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    initials VARCHAR(10),
    salutation VARCHAR(40),
    suffix VARCHAR(40),
    country VARCHAR(90),
    phone VARCHAR(24),
    mailing_address TEXT,
    billing_address TEXT,
    must_change_password BOOLEAN DEFAULT false,
    auth_id BIGINT,
    auth_string TEXT,
    disabled BOOLEAN DEFAULT false,
    date_last_login TIMESTAMP WITH TIME ZONE,
    date_registered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_validated TIMESTAMP WITH TIME ZONE,
    date_last_email TIMESTAMP WITH TIME ZONE,
    inline_help BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journals table (context/tenant)
CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(255) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT true,
    primary_locale VARCHAR(10) DEFAULT 'en_US',
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Journal settings table (key-value store for journal configuration)
CREATE TABLE IF NOT EXISTS journal_settings (
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (journal_id, setting_name, locale)
);

-- User settings table (key-value store for user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (user_id, setting_name, locale)
);

-- User groups table (roles within journals)
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    show_title BOOLEAN DEFAULT false,
    permit_self_registration BOOLEAN DEFAULT false,
    permit_metadata_edit BOOLEAN DEFAULT false,
    recommend_only BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User group settings table
CREATE TABLE IF NOT EXISTS user_group_settings (
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (user_group_id, setting_name, locale)
);

-- User to user group assignments
CREATE TABLE IF NOT EXISTS user_user_groups (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, user_group_id)
);

-- Sections table (article categories)
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    editor_restricted BOOLEAN DEFAULT false,
    meta_indexed BOOLEAN DEFAULT true,
    meta_reviewed BOOLEAN DEFAULT true,
    abstracts_not_required BOOLEAN DEFAULT false,
    hide_title BOOLEAN DEFAULT false,
    hide_author BOOLEAN DEFAULT false,
    is_inactive BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Section settings table
CREATE TABLE IF NOT EXISTS section_settings (
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (section_id, setting_name, locale)
);

-- Genres table (file types/categories)
CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    enabled BOOLEAN DEFAULT true,
    category INTEGER DEFAULT 1,
    dependent BOOLEAN DEFAULT false,
    supplementary BOOLEAN DEFAULT false,
    entry_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Genre settings table
CREATE TABLE IF NOT EXISTS genre_settings (
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (genre_id, setting_name, locale)
);

-- Submissions table (manuscripts/articles)
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    stage_id INTEGER DEFAULT 1,
    status INTEGER DEFAULT 1,
    current_publication_id UUID,
    date_submitted TIMESTAMP WITH TIME ZONE,
    date_last_activity TIMESTAMP WITH TIME ZONE,
    date_status_modified TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publications table (versions of submissions)
CREATE TABLE IF NOT EXISTS publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    status INTEGER DEFAULT 1,
    primary_locale VARCHAR(10) DEFAULT 'en_US',
    date_published TIMESTAMP WITH TIME ZONE,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publication settings table
CREATE TABLE IF NOT EXISTS publication_settings (
    publication_id UUID NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (publication_id, setting_name, locale)
);

-- Submission files table
CREATE TABLE IF NOT EXISTS submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    file_stage INTEGER NOT NULL,
    genre_id UUID REFERENCES genres(id),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    original_file_name VARCHAR(255),
    uploader_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review rounds table
CREATE TABLE IF NOT EXISTS review_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    round INTEGER DEFAULT 1,
    status INTEGER DEFAULT 1,
    date_status_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review assignments table
CREATE TABLE IF NOT EXISTS review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_round_id UUID NOT NULL REFERENCES review_rounds(id) ON DELETE CASCADE,
    stage_id INTEGER NOT NULL,
    status INTEGER DEFAULT 0,
    date_assigned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_notified TIMESTAMP WITH TIME ZONE,
    date_confirmed TIMESTAMP WITH TIME ZONE,
    date_completed TIMESTAMP WITH TIME ZONE,
    date_due TIMESTAMP WITH TIME ZONE,
    date_response_due TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reminder_was_automatic INTEGER DEFAULT 0,
    declined INTEGER DEFAULT 0,
    cancelled INTEGER DEFAULT 0,
    quality INTEGER,
    recommendation INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review assignment settings table
CREATE TABLE IF NOT EXISTS review_assignment_settings (
    review_assignment_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    PRIMARY KEY (review_assignment_id, setting_name)
);

-- Review forms table
CREATE TABLE IF NOT EXISTS review_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER,
    assoc_id UUID,
    seq INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review form settings table
CREATE TABLE IF NOT EXISTS review_form_settings (
    review_form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (review_form_id, setting_name, locale)
);

-- Review form elements table
CREATE TABLE IF NOT EXISTS review_form_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    seq INTEGER DEFAULT 0,
    element_type INTEGER NOT NULL,
    required BOOLEAN DEFAULT false,
    included BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review form element settings table
CREATE TABLE IF NOT EXISTS review_form_element_settings (
    review_form_element_id UUID NOT NULL REFERENCES review_form_elements(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (review_form_element_id, setting_name, locale)
);

-- Review form responses table
CREATE TABLE IF NOT EXISTS review_form_responses (
    review_form_element_id UUID NOT NULL REFERENCES review_form_elements(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    response_type VARCHAR(255) DEFAULT 'string',
    response_value TEXT,
    PRIMARY KEY (review_form_element_id, review_id)
);

-- Issues table (journal issues/volumes)
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    volume INTEGER DEFAULT 0,
    number VARCHAR(255) DEFAULT '0',
    year INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    date_published TIMESTAMP WITH TIME ZONE,
    date_notified TIMESTAMP WITH TIME ZONE,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_status INTEGER DEFAULT 0,
    open_access_date TIMESTAMP WITH TIME ZONE,
    show_volume BOOLEAN DEFAULT false,
    show_number BOOLEAN DEFAULT false,
    show_year BOOLEAN DEFAULT false,
    show_title BOOLEAN DEFAULT false,
    style_file_name VARCHAR(255),
    original_style_file_name VARCHAR(255),
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Issue settings table
CREATE TABLE IF NOT EXISTS issue_settings (
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (issue_id, setting_name, locale)
);

-- Navigation menus table
CREATE TABLE IF NOT EXISTS navigation_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    area_name VARCHAR(255) NOT NULL,
    menu_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation menu items table
CREATE TABLE IF NOT EXISTS navigation_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    navigation_menu_id UUID NOT NULL REFERENCES navigation_menus(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    menu_item_type VARCHAR(255) NOT NULL,
    seq INTEGER DEFAULT 0,
    parent_id UUID REFERENCES navigation_menu_items(id) ON DELETE CASCADE,
    path VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Navigation menu item settings table
CREATE TABLE IF NOT EXISTS navigation_menu_item_settings (
    navigation_menu_item_id UUID NOT NULL REFERENCES navigation_menu_items(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (navigation_menu_item_id, setting_name, locale)
);

-- Email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    email_key VARCHAR(255) NOT NULL,
    can_disable BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT true,
    from_role_id BIGINT,
    to_role_id BIGINT,
    stage_id INTEGER,
    seq INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email template settings table
CREATE TABLE IF NOT EXISTS email_template_settings (
    email_template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (email_template_id, setting_name, locale)
);

-- Library files table (journal-level files)
CREATE TABLE IF NOT EXISTS library_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    original_file_name VARCHAR(255),
    file_stage INTEGER NOT NULL,
    genre_id UUID REFERENCES genres(id),
    uploader_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library file settings table
CREATE TABLE IF NOT EXISTS library_file_settings (
    library_file_id UUID NOT NULL REFERENCES library_files(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (library_file_id, setting_name, locale)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER,
    assoc_id UUID,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    description_short TEXT,
    type_id UUID,
    date_expire TIMESTAMP WITH TIME ZONE,
    date_posted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcement settings table
CREATE TABLE IF NOT EXISTS announcement_settings (
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    setting_name VARCHAR(255) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(6) DEFAULT 'string',
    locale VARCHAR(10) DEFAULT '',
    PRIMARY KEY (announcement_id, setting_name, locale)
);

-- Access keys table (for secure access)
CREATE TABLE IF NOT EXISTS access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assoc_id UUID,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(255),
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes table (editorial notes)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assoc_type INTEGER NOT NULL,
    assoc_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title VARCHAR(255),
    contents TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queued payments table
CREATE TABLE IF NOT EXISTS queued_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE,
    payment_data TEXT NOT NULL
);

-- Completed payments table
CREATE TABLE IF NOT EXISTS completed_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    assoc_id UUID,
    amount NUMERIC NOT NULL,
    currency_code VARCHAR(255) NOT NULL,
    payment_method_plugin_name VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_journals_path ON journals(path);
CREATE INDEX idx_submissions_context ON submissions(context_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_publications_submission ON publications(submission_id);
CREATE INDEX idx_review_assignments_submission ON review_assignments(submission_id);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_user_user_groups_user ON user_user_groups(user_id);
CREATE INDEX idx_user_user_groups_group ON user_user_groups(user_group_id);
CREATE INDEX idx_sections_journal ON sections(journal_id);
CREATE INDEX idx_genres_context ON genres(context_id);
CREATE INDEX idx_submission_files_submission ON submission_files(submission_id);

-- Verify schema creation
SELECT 'OJS schema created successfully' as status;