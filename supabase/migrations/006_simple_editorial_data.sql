-- Migration: Simple Editorial Data
-- Description: Insert basic editorial workflow data for testing

-- Insert sections for Test Journal
INSERT INTO sections (id, journal_id, seq, editor_restricted, meta_indexed, meta_reviewed, abstracts_not_required, hide_title, hide_author, is_inactive) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, false, true, true, false, false, false, false),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 2, false, true, true, false, false, false, false),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 3, true, true, true, false, false, false, false);

-- Insert section settings
INSERT INTO section_settings (section_id, locale, setting_name, setting_value, setting_type) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'en_US', 'title', 'Articles', 'string'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'en_US', 'abbrev', 'ART', 'string'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'en_US', 'policy', 'Original research articles', 'string'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'en_US', 'title', 'Reviews', 'string'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'en_US', 'abbrev', 'REV', 'string'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'en_US', 'policy', 'Review articles', 'string'),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'en_US', 'title', 'Editorials', 'string'),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'en_US', 'abbrev', 'EDT', 'string'),
('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'en_US', 'policy', 'Editorial content', 'string');

-- Insert submissions
INSERT INTO submissions (id, context_id, stage_id, status, date_submitted, date_last_activity, date_status_modified) VALUES
('11111111-1111-1111-1111-111111111112'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111113'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 3, 1, NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('11111111-1111-1111-1111-111111111114'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 5, 3, NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('11111111-1111-1111-1111-111111111115'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('11111111-1111-1111-1111-111111111116'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 2, NOW() - INTERVAL '35 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

-- Insert publications
INSERT INTO publications (id, submission_id, version, date_published, status, seq) VALUES
('22222222-2222-2222-2222-222222222223'::uuid, '11111111-1111-1111-1111-111111111112'::uuid, 1, NULL, 3, 1),
('22222222-2222-2222-2222-222222222224'::uuid, '11111111-1111-1111-1111-111111111113'::uuid, 1, NULL, 3, 1),
('22222222-2222-2222-2222-222222222225'::uuid, '11111111-1111-1111-1111-111111111114'::uuid, 1, NOW() - INTERVAL '5 days', 3, 1),
('22222222-2222-2222-2222-222222222226'::uuid, '11111111-1111-1111-1111-111111111115'::uuid, 1, NULL, 3, 1),
('22222222-2222-2222-2222-222222222227'::uuid, '11111111-1111-1111-1111-111111111116'::uuid, 1, NULL, 3, 1);

-- Update submissions with current_publication_id
UPDATE submissions SET current_publication_id = '22222222-2222-2222-2222-222222222223'::uuid WHERE id = '11111111-1111-1111-1111-111111111112'::uuid;
UPDATE submissions SET current_publication_id = '22222222-2222-2222-2222-222222222224'::uuid WHERE id = '11111111-1111-1111-1111-111111111113'::uuid;
UPDATE submissions SET current_publication_id = '22222222-2222-2222-2222-222222222225'::uuid WHERE id = '11111111-1111-1111-1111-111111111114'::uuid;
UPDATE submissions SET current_publication_id = '22222222-2222-2222-2222-222222222226'::uuid WHERE id = '11111111-1111-1111-1111-111111111115'::uuid;
UPDATE submissions SET current_publication_id = '22222222-2222-2222-2222-222222222227'::uuid WHERE id = '11111111-1111-1111-1111-111111111116'::uuid;

-- Insert publication settings
INSERT INTO publication_settings (publication_id, locale, setting_name, setting_value, setting_type) VALUES
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'title', 'Machine Learning in Medical Diagnosis: A Comprehensive Review', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'abstract', 'This paper presents a comprehensive review of machine learning applications in medical diagnosis.', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'prefix', '', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'subtitle', '', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'type', 'research-article', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'sectionId', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'pages', '1-15', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'copyrightYear', '2024', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'copyrightHolder', 'Test Journal', 'string'),
('22222222-2222-2222-2222-222222222223'::uuid, 'en_US', 'licenseUrl', 'https://creativecommons.org/licenses/by/4.0/', 'string'),

('22222222-2222-2222-2222-222222222224'::uuid, 'en_US', 'title', 'Deep Learning Approaches for Natural Language Processing', 'string'),
('22222222-2222-2222-2222-222222222224'::uuid, 'en_US', 'abstract', 'This study explores various deep learning approaches for natural language processing tasks.', 'string'),
('22222222-2222-2222-2222-222222222224'::uuid, 'en_US', 'type', 'research-article', 'string'),
('22222222-2222-2222-2222-222222222224'::uuid, 'en_US', 'sectionId', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'string'),
('22222222-2222-2222-2222-222222222224'::uuid, 'en_US', 'pages', '16-30', 'string'),

('22222222-2222-2222-2222-222222222225'::uuid, 'en_US', 'title', 'Blockchain Technology in Healthcare: Opportunities and Challenges', 'string'),
('22222222-2222-2222-2222-222222222225'::uuid, 'en_US', 'abstract', 'This article examines the opportunities and challenges of implementing blockchain technology in healthcare systems.', 'string'),
('22222222-2222-2222-2222-222222222225'::uuid, 'en_US', 'type', 'research-article', 'string'),
('22222222-2222-2222-2222-222222222225'::uuid, 'en_US', 'sectionId', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'string'),
('22222222-2222-2222-2222-222222222225'::uuid, 'en_US', 'pages', '31-45', 'string'),

('22222222-2222-2222-2222-222222222226'::uuid, 'en_US', 'title', 'The Future of Artificial Intelligence in Education', 'string'),
('22222222-2222-2222-2222-222222222226'::uuid, 'en_US', 'abstract', 'This paper discusses the potential impact of artificial intelligence on the future of education.', 'string'),
('22222222-2222-2222-2222-222222222226'::uuid, 'en_US', 'type', 'research-article', 'string'),
('22222222-2222-2222-2222-222222222226'::uuid, 'en_US', 'sectionId', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'string'),
('22222222-2222-2222-2222-222222222226'::uuid, 'en_US', 'pages', '46-60', 'string'),

('22222222-2222-2222-2222-222222222227'::uuid, 'en_US', 'title', 'Cybersecurity in the Digital Age: A Review of Current Threats', 'string'),
('22222222-2222-2222-2222-222222222227'::uuid, 'en_US', 'abstract', 'This review paper analyzes current cybersecurity threats and mitigation strategies.', 'string'),
('22222222-2222-2222-2222-222222222227'::uuid, 'en_US', 'type', 'research-article', 'string'),
('22222222-2222-2222-2222-222222222227'::uuid, 'en_US', 'sectionId', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'string'),
('22222222-2222-2222-2222-222222222227'::uuid, 'en_US', 'pages', '61-75', 'string');