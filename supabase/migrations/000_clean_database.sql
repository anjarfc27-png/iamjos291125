-- Clean all data from existing OJS tables in proper order to avoid foreign key constraints
-- This will remove all data but keep the table structures

-- Disable triggers temporarily to allow clean deletion
SET session_replication_role = replica;

-- Clean data in reverse order of dependencies (children first, parents last)
-- Start with review-related tables (no dependencies)
DELETE FROM review_assignment_settings;
DELETE FROM review_form_responses;
DELETE FROM review_form_element_settings;
DELETE FROM review_form_elements;
DELETE FROM review_form_settings;
DELETE FROM review_forms;
DELETE FROM review_assignments;
DELETE FROM review_rounds;

-- Clean submission-related tables
DELETE FROM submission_files;
DELETE FROM publications;
DELETE FROM submissions;

-- Clean section and genre tables
DELETE FROM section_settings;
DELETE FROM sections;
DELETE FROM genre_settings;
DELETE FROM genres;

-- Clean user-related tables
DELETE FROM user_user_groups;
DELETE FROM user_group_settings;
DELETE FROM user_groups;
DELETE FROM user_settings;
DELETE FROM users;

-- Clean journal-related tables
DELETE FROM journal_settings;
DELETE FROM navigation_menu_item_settings;
DELETE FROM navigation_menu_items;
DELETE FROM navigation_menus;
DELETE FROM email_template_settings;
DELETE FROM email_templates;
DELETE FROM library_file_settings;
DELETE FROM library_files;
DELETE FROM announcement_settings;
DELETE FROM announcements;
DELETE FROM issue_settings;
DELETE FROM issues;
DELETE FROM completed_payments;
DELETE FROM queued_payments;
DELETE FROM access_keys;
DELETE FROM sessions;
DELETE FROM notes;
DELETE FROM journals;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify clean state
SELECT 'Database cleaned successfully' as status;