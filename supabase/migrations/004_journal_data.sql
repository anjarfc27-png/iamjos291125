-- Migration: Journal Data
-- Description: Insert sample journal data for testing

-- Insert sample journals
INSERT INTO journals (id, path, seq, primary_locale, enabled) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'test-journal', 1, 'en_US', true),
('22222222-2222-2222-2222-222222222222'::uuid, 'demo-journal', 2, 'en_US', true);

-- Insert journal settings
INSERT INTO journal_settings (journal_id, locale, setting_name, setting_value, setting_type) VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'name', 'Test Journal', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'description', 'A test journal for OJS development', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'contactName', 'Journal Manager', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'contactEmail', 'manager@example.com', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'supportName', 'Technical Support', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'supportEmail', 'support@example.com', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'publisherInstitution', 'Test University', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'onlineIssn', '1234-5678', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'printIssn', '8765-4321', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'abbreviation', 'TJ', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'homepageImage', '', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'pageHeaderLogoImage', '', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'journalPageHeaderTitleType', 'title', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'themePluginPath', 'default', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'itemsPerPage', '25', 'int'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'enableAnnouncements', '1', 'bool'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'enableUserRegistration', '1', 'bool'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'restrictSiteAccess', '0', 'bool'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'restrictArticleAccess', '0', 'bool'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'copyrightNotice', 'Copyright (c) 2024 Test Journal', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'privacyStatement', 'This journal respects your privacy.', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'openAccessPolicy', 'This journal provides immediate open access to its content.', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'authorGuidelines', 'Please follow the author guidelines.', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'submissionChecklist', 'Submission checklist items here.', 'string'),
('11111111-1111-1111-1111-111111111111'::uuid, 'en_US', 'reviewGuidelines', 'Review guidelines here.', 'string');

-- Insert journal settings for second journal
INSERT INTO journal_settings (journal_id, locale, setting_name, setting_value, setting_type) VALUES
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'name', 'Demo Journal', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'description', 'A demonstration journal', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'contactName', 'Demo Manager', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'contactEmail', 'demo@example.com', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'publisherInstitution', 'Demo University', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'abbreviation', 'DJ', 'string'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'enableUserRegistration', '1', 'bool'),
('22222222-2222-2222-2222-222222222222'::uuid, 'en_US', 'copyrightNotice', 'Copyright (c) 2024 Demo Journal', 'string');