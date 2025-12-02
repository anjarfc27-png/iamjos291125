-- OJS 3.3 Editorial Data for Sections and Workflow
-- Data untuk testing workflow editorial lengkap

-- Insert sections for the journal
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO sections (id, journal_id, seq, editor_restricted, meta_indexed, meta_reviewed, abstracts_not_required, hide_title, hide_author, is_inactive, abstract_word_count) VALUES
('60000000-0000-0000-0000-000000000001', (SELECT id FROM journal), 1, 0, 1, 1, 0, 0, 0, 0, 250),
('60000000-0000-0000-0000-000000000002', (SELECT id FROM journal), 2, 0, 1, 1, 0, 0, 0, 0, 250),
('60000000-0000-0000-0000-000000000003', (SELECT id FROM journal), 3, 0, 1, 1, 0, 0, 0, 0, 250),
('60000000-0000-0000-0000-000000000004', (SELECT id FROM journal), 4, 0, 1, 0, 0, 0, 0, 0, 250),
('60000000-0000-0000-0000-000000000005', (SELECT id FROM journal), 5, 1, 0, 1, 1, 0, 0, 0, 150);

-- Insert section settings
INSERT INTO section_settings (section_id, setting_name, setting_value, setting_type, locale) VALUES
('60000000-0000-0000-0000-000000000001', 'title', 'Articles', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000001', 'abbrev', 'ART', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000001', 'policy', 'Original research articles in computer science and information technology.', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000001', 'identifyType', 'Article', 'string', 'en_US'),

('60000000-0000-0000-0000-000000000002', 'title', 'Review Articles', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000002', 'abbrev', 'REV', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000002', 'policy', 'Comprehensive review articles on specific topics.', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000002', 'identifyType', 'Review Article', 'string', 'en_US'),

('60000000-0000-0000-0000-000000000003', 'title', 'Short Communications', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000003', 'abbrev', 'SC', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000003', 'policy', 'Brief communications of preliminary results or technical notes.', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000003', 'identifyType', 'Short Communication', 'string', 'en_US'),

('60000000-0000-0000-0000-000000000004', 'title', 'Case Studies', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000004', 'abbrev', 'CS', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000004', 'policy', 'Case studies and practical applications.', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000004', 'identifyType', 'Case Study', 'string', 'en_US'),

('60000000-0000-0000-0000-000000000005', 'title', 'Editorial', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000005', 'abbrev', 'ED', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000005', 'policy', 'Editorial content and announcements.', 'string', 'en_US'),
('60000000-0000-0000-0000-000000000005', 'identifyType', 'Editorial', 'string', 'en_US');

-- Update submissions to assign sections
UPDATE submissions SET section_id = '60000000-0000-0000-0000-000000000001' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE submissions SET section_id = '60000000-0000-0000-0000-000000000002' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE submissions SET section_id = '60000000-0000-0000-0000-000000000003' WHERE id = '10000000-0000-0000-0000-000000000003';
UPDATE submissions SET section_id = '60000000-0000-0000-0000-000000000001' WHERE id = '10000000-0000-0000-0000-000000000004';
UPDATE submissions SET section_id = '60000000-0000-0000-0000-000000000004' WHERE id = '10000000-0000-0000-0000-000000000005';

-- Insert editorial assignments for section editors
WITH section_editor1 AS (SELECT id FROM users WHERE username = 'sectioneditor1' LIMIT 1),
     section_editor2 AS (SELECT id FROM users WHERE username = 'guesteditor1' LIMIT 1),
     section_articles AS (SELECT id FROM sections WHERE id = '60000000-0000-0000-0000-000000000001' LIMIT 1),
     section_reviews AS (SELECT id FROM sections WHERE id = '60000000-0000-0000-0000-000000000002' LIMIT 1)
INSERT INTO section_editors (user_id, section_id) VALUES
((SELECT id FROM section_editor1), (SELECT id FROM section_articles)),
((SELECT id FROM section_editor2), (SELECT id FROM section_reviews));

-- Insert copyedit assignments
WITH copyeditor1 AS (SELECT id FROM users WHERE username = 'copyeditor1' LIMIT 1),
     submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1)
INSERT INTO copyedit_assignments (id, submission_id, copyeditor_id, date_notified, date_author_notified, date_copyeditor_notified, date_completed, date_author_completed, date_final_completed, copyeditor_file_id, initial_file_id, final_file_id) VALUES
('70000000-0000-0000-0000-000000000001', (SELECT id FROM submission1), (SELECT id FROM copyeditor1), NOW() - INTERVAL '3 days', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('70000000-0000-0000-0000-000000000002', (SELECT id FROM submission2), (SELECT id FROM copyeditor1), NOW() - INTERVAL '2 days', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- Insert layout assignments
WITH layouteditor1 AS (SELECT id FROM users WHERE username = 'layouteditor1' LIMIT 1),
     submission3 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000003' LIMIT 1),
     submission4 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000004' LIMIT 1)
INSERT INTO layout_assignments (id, submission_id, layout_editor_id, date_notified, date_completed, layout_file_id, layout_file_production_ready) VALUES
('80000000-0000-0000-0000-000000000001', (SELECT id FROM submission3), (SELECT id FROM layouteditor1), NOW() - INTERVAL '1 day', NULL, NULL, NULL),
('80000000-0000-0000-0000-000000000002', (SELECT id FROM submission4), (SELECT id FROM layouteditor1), NOW(), NULL, NULL, NULL);

-- Insert proof assignments
WITH proofreader1 AS (SELECT id FROM users WHERE username = 'proofreader1' LIMIT 1),
     submission4 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000004' LIMIT 1),
     submission5 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000005' LIMIT 1)
INSERT INTO proof_assignments (id, submission_id, proofreader_id, date_notified, date_completed, proofreader_file_id, proofreader_comments) VALUES
('90000000-0000-0000-0000-000000000001', (SELECT id FROM submission4), (SELECT id FROM proofreader1), NOW() - INTERVAL '1 day', NULL, NULL, NULL),
('90000000-0000-0000-0000-000000000002', (SELECT id FROM submission5), (SELECT id FROM proofreader1), NOW(), NULL, NULL, NULL);

-- Insert editorial decisions
WITH editor1 AS (SELECT id FROM users WHERE username = 'editor1' LIMIT 1),
     submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1),
     submission3 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000003' LIMIT 1)
INSERT INTO edit_decisions (id, submission_id, review_round_id, stage_id, editor_id, decision, date_decided) VALUES
('10000000-0000-0000-0000-000000000001', (SELECT id FROM submission1), 1, 3, (SELECT id FROM editor1), 1, NOW() - INTERVAL '7 days'),
('10000000-0000-0000-0000-000000000002', (SELECT id FROM submission2), 1, 3, (SELECT id FROM editor1), 2, NOW() - INTERVAL '5 days'),
('10000000-0000-0000-0000-000000000003', (SELECT id FROM submission3), 1, 3, (SELECT id FROM editor1), 1, NOW() - INTERVAL '3 days');

-- Insert submission files
WITH submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1),
     author1 AS (SELECT id FROM users WHERE username = 'author1' LIMIT 1),
     author2 AS (SELECT id FROM users WHERE username = 'author2' LIMIT 1),
     genre_article AS (SELECT id FROM genres WHERE entry_key = 'SUBMISSION' LIMIT 1)
INSERT INTO submission_files (id, submission_id, file_stage, file_name, file_size, file_type, original_file_name, date_uploaded, date_modified, user_id, genre_id, viewable, source_file_id, source_revision, file_state, revision, assoc_type, assoc_id, direct_sales_price, sales_type, locale) VALUES
('11000000-0000-0000-0000-000000000001', (SELECT id FROM submission1), 2, 'submission-1.pdf', 1024000, 'application/pdf', 'machine-learning-weather-prediction.pdf', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', (SELECT id FROM author1), (SELECT id FROM genre_article), 1, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, 'en_US'),
('11000000-0000-0000-0000-000000000002', (SELECT id FROM submission2), 2, 'submission-2.pdf', 1536000, 'application/pdf', 'distributed-systems-ecommerce.pdf', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', (SELECT id FROM author2), (SELECT id FROM genre_article), 1, NULL, NULL, 1, 1, NULL, NULL, NULL, NULL, 'en_US');

-- Insert submission metadata
WITH submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1),
     submission3 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000003' LIMIT 1),
     submission4 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000004' LIMIT 1),
     submission5 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000005' LIMIT 1)
INSERT INTO submission_settings (submission_id, setting_name, setting_value, setting_type, locale) VALUES
((SELECT id FROM submission1), 'submissionFile', '11000000-0000-0000-0000-000000000001', 'string', 'en_US'),
((SELECT id FROM submission1), 'copyrightYear', '2024', 'string', 'en_US'),
((SELECT id FROM submission1), 'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/', 'string', 'en_US'),

((SELECT id FROM submission2), 'submissionFile', '11000000-0000-0000-0000-000000000002', 'string', 'en_US'),
((SELECT id FROM submission2), 'copyrightYear', '2024', 'string', 'en_US'),
((SELECT id FROM submission2), 'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/', 'string', 'en_US'),

((SELECT id FROM submission3), 'submissionFile', '', 'string', 'en_US'),
((SELECT id FROM submission3), 'copyrightYear', '2024', 'string', 'en_US'),

((SELECT id FROM submission4), 'submissionFile', '', 'string', 'en_US'),
((SELECT id FROM submission4), 'copyrightYear', '2024', 'string', 'en_US'),

((SELECT id FROM submission5), 'submissionFile', '', 'string', 'en_US'),
((SELECT id FROM submission5), 'copyrightYear', '2024', 'string', 'en_US');