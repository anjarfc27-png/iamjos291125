-- Editorial workflow data for testing
-- This includes sections, submissions, publications, and review data

-- Insert sections for the main journal
INSERT INTO sections (id, journal_id, seq, editor_restricted, meta_indexed, meta_reviewed, abstracts_not_required, hide_title, hide_author, is_inactive, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, false, true, true, false, false, false, false, NOW(), NOW()),
('b2c3d4e5-f6a7-8901-bcde-f23456789012'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 2, false, true, true, false, false, false, false, NOW(), NOW()),
('c3d4e5f6-a7b8-9012-cdef-345678901234'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 3, false, true, true, false, false, false, false, NOW(), NOW());

-- Insert section settings for multilingual support
INSERT INTO section_settings (section_id, setting_name, setting_value, setting_type, locale) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'title', 'Articles', 'string', 'en_US'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'title', 'Artikel', 'string', 'id_ID'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid, 'abbrev', 'ART', 'string', 'en_US'),
('b2c3d4e5-f6a7-8901-bcde-f23456789012'::uuid, 'title', 'Review Articles', 'string', 'en_US'),
('b2c3d4e5-f6a7-8901-bcde-f23456789012'::uuid, 'title', 'Artikel Ulasan', 'string', 'id_ID'),
('b2c3d4e5-f6a7-8901-bcde-f23456789012'::uuid, 'abbrev', 'REV', 'string', 'en_US'),
('c3d4e5f6-a7b8-9012-cdef-345678901234'::uuid, 'title', 'Short Communications', 'string', 'en_US'),
('c3d4e5f6-a7b8-9012-cdef-345678901234'::uuid, 'title', 'Komunikasi Singkat', 'string', 'id_ID'),
('c3d4e5f6-a7b8-9012-cdef-345678901234'::uuid, 'abbrev', 'SC', 'string', 'en_US');

-- Insert sample submissions
INSERT INTO submissions (id, context_id, stage_id, status, date_submitted, date_last_activity, date_status_modified, last_modified, created_at, updated_at) VALUES
('sub1-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '10 days', NOW()),
('sub2-2222-2222-2222-222222222222'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 3, 1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '15 days', NOW()),
('sub3-3333-3333-3333-333333333333'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '20 days', NOW()),
('sub4-4444-4444-4444-444444444444'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 5, 3, NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '25 days', NOW()),
('sub5-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 1, 1, NOW() - INTERVAL '30 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '30 days', NOW());

-- Insert publications for submissions
INSERT INTO publications (id, submission_id, version, status, primary_locale, date_published, seq, created_at, updated_at) VALUES
('pub1-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 1, 1, 'en_US', NULL, 1, NOW(), NOW()),
('pub2-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 1, 1, 'en_US', NULL, 1, NOW(), NOW()),
('pub3-3333-3333-3333-333333333333'::uuid, 'sub3-3333-3333-3333-333333333333'::uuid, 1, 1, 'en_US', NULL, 1, NOW(), NOW()),
('pub4-4444-4444-4444-444444444444'::uuid, 'sub4-4444-4444-4444-444444444444'::uuid, 1, 3, 'en_US', NOW() - INTERVAL '3 days', 1, NOW(), NOW()),
('pub5-5555-5555-5555-555555555555'::uuid, 'sub5-5555-5555-5555-555555555555'::uuid, 1, 1, 'en_US', NULL, 1, NOW(), NOW());

-- Insert publication settings (titles, abstracts, etc.)
INSERT INTO publication_settings (publication_id, setting_name, setting_value, setting_type, locale) VALUES
-- Publication 1
('pub1-1111-1111-1111-111111111111'::uuid, 'title', 'The Impact of Digital Technology on Academic Publishing: A Comprehensive Review', 'string', 'en_US'),
('pub1-1111-1111-1111-111111111111'::uuid, 'abstract', 'This study examines the transformative impact of digital technology on academic publishing, analyzing changes in peer review processes, open access models, and dissemination strategies. The research methodology includes comprehensive literature review and case study analysis of major publishing platforms.', 'string', 'en_US'),
('pub1-1111-1111-1111-111111111111'::uuid, 'sectionId', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'string', 'en_US'),
-- Publication 2
('pub2-2222-2222-2222-222222222222'::uuid, 'title', 'Machine Learning Applications in Scholarly Communication', 'string', 'en_US'),
('pub2-2222-2222-2222-222222222222'::uuid, 'abstract', 'This paper explores the application of machine learning techniques in scholarly communication, including automated peer review assignment, plagiarism detection, and citation analysis. The study demonstrates significant improvements in efficiency and accuracy compared to traditional methods.', 'string', 'en_US'),
('pub2-2222-2222-2222-222222222222'::uuid, 'sectionId', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'string', 'en_US'),
-- Publication 3
('pub3-3333-3333-3333-333333333333'::uuid, 'title', 'Open Access Publishing: Challenges and Opportunities in Developing Countries', 'string', 'en_US'),
('pub3-3333-3333-3333-333333333333'::uuid, 'abstract', 'This research investigates the challenges and opportunities associated with open access publishing in developing countries. The study identifies key barriers including funding constraints, infrastructure limitations, and policy frameworks, while highlighting successful initiatives and best practices.', 'string', 'en_US'),
('pub3-3333-3333-3333-333333333333'::uuid, 'sectionId', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'string', 'en_US'),
-- Publication 4
('pub4-4444-4444-4444-444444444444'::uuid, 'title', 'Peer Review in the Digital Age: Quality Assurance Mechanisms', 'string', 'en_US'),
('pub4-4444-4444-4444-444444444444'::uuid, 'abstract', 'This article examines the evolution of peer review processes in the digital age, focusing on innovations such as open peer review, post-publication review, and AI-assisted review. The study evaluates the effectiveness of these new approaches in maintaining publication quality.', 'string', 'en_US'),
('pub4-4444-4444-4444-444444444444'::uuid, 'sectionId', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'string', 'en_US'),
-- Publication 5
('pub5-5555-5555-5555-555555555555'::uuid, 'title', 'Citation Analysis and Research Impact Measurement: Current Trends', 'string', 'en_US'),
('pub5-5555-5555-5555-555555555555'::uuid, 'abstract', 'This study provides a comprehensive analysis of current trends in citation analysis and research impact measurement. The research explores traditional citation metrics alongside alternative metrics, discussing their strengths, limitations, and appropriate applications in research evaluation.', 'string', 'en_US'),
('pub5-5555-5555-5555-555555555555'::uuid, 'sectionId', 'c3d4e5f6-a7b8-9012-cdef-345678901234', 'string', 'en_US');

-- Insert review rounds for submissions
INSERT INTO review_rounds (id, submission_id, stage_id, round, status, date_status_modified, created_at) VALUES
('round1-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 3, 1, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('round2-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 3, 1, 3, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('round3-3333-3333-3333-333333333333'::uuid, 'sub3-3333-3333-3333-333333333333'::uuid, 3, 1, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

-- Insert review assignments
INSERT INTO review_assignments (id, submission_id, reviewer_id, review_round_id, stage_id, status, date_assigned, date_due, date_response_due, created_at, updated_at) VALUES
-- Review assignments for submission 1
('rev1-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 'user-reviewer1'::uuid, 'round1-1111-1111-1111-111111111111'::uuid, 3, 1, NOW() - INTERVAL '4 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
('rev2-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 'user-reviewer2'::uuid, 'round1-1111-1111-1111-111111111111'::uuid, 3, 1, NOW() - INTERVAL '4 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW()),
-- Review assignments for submission 2 (completed)
('rev3-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 'user-reviewer3'::uuid, 'round2-2222-2222-2222-222222222222'::uuid, 3, 3, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW()),
('rev4-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 'user-reviewer4'::uuid, 'round2-2222-2222-2222-222222222222'::uuid, 3, 3, NOW() - INTERVAL '12 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '12 days', NOW()),
-- Review assignments for submission 3
('rev5-3333-3333-3333-333333333333'::uuid, 'sub3-3333-3333-3333-333333333333'::uuid, 'user-reviewer1'::uuid, 'round3-3333-3333-3333-333333333333'::uuid, 3, 1, NOW() - INTERVAL '2 days', NOW() + INTERVAL '14 days', NOW() + INTERVAL '7 days', NOW() - INTERVAL '2 days', NOW());

-- Insert submission files
INSERT INTO submission_files (id, submission_id, file_stage, genre_id, file_name, file_type, file_size, original_file_name, uploader_user_id, created_at, updated_at) VALUES
-- Files for submission 1
('file1-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 2, 'genre-manuscript'::uuid, 'submission1_manuscript.pdf', 'application/pdf', 1024000, 'manuscript_draft.pdf', 'user-author1'::uuid, NOW() - INTERVAL '10 days', NOW()),
('file2-1111-1111-1111-111111111111'::uuid, 'sub1-1111-1111-1111-111111111111'::uuid, 10, 'genre-supplement'::uuid, 'submission1_data.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 512000, 'research_data.xlsx', 'user-author1'::uuid, NOW() - INTERVAL '9 days', NOW()),
-- Files for submission 2
('file3-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 2, 'genre-manuscript'::uuid, 'submission2_manuscript.pdf', 'application/pdf', 1152000, 'ml_paper_final.pdf', 'user-author2'::uuid, NOW() - INTERVAL '15 days', NOW()),
('file4-2222-2222-2222-222222222222'::uuid, 'sub2-2222-2222-2222-222222222222'::uuid, 3, 'genre-manuscript'::uuid, 'submission2_revised.pdf', 'application/pdf', 1228800, 'ml_paper_revised.pdf', 'user-author2'::uuid, NOW() - INTERVAL '8 days', NOW()),
-- Files for submission 3
('file5-3333-3333-3333-333333333333'::uuid, 'sub3-3333-3333-3333-333333333333'::uuid, 2, 'genre-manuscript'::uuid, 'submission3_manuscript.pdf', 'application/pdf', 983000, 'open_access_study.pdf', 'user-author3'::uuid, NOW() - INTERVAL '20 days', NOW()),
-- Files for submission 4 (published)
('file6-4444-4444-4444-444444444444'::uuid, 'sub4-4444-4444-4444-444444444444'::uuid, 2, 'genre-manuscript'::uuid, 'submission4_manuscript.pdf', 'application/pdf', 1088000, 'peer_review_analysis.pdf', 'user-author4'::uuid, NOW() - INTERVAL '25 days', NOW()),
('file7-4444-4444-4444-444444444444'::uuid, 'sub4-4444-4444-4444-444444444444'::uuid, 7, 'genre-manuscript'::uuid, 'submission4_galley.pdf', 'application/pdf', 2048000, 'peer_review_final.pdf', 'user-editor1'::uuid, NOW() - INTERVAL '5 days', NOW()),
-- Files for submission 5
('file8-5555-5555-5555-555555555555'::uuid, 'sub5-5555-5555-5555-555555555555'::uuid, 2, 'genre-manuscript'::uuid, 'submission5_manuscript.pdf', 'application/pdf', 921600, 'citation_analysis_paper.pdf', 'user-author5'::uuid, NOW() - INTERVAL '30 days', NOW());

-- Verify data insertion
SELECT 'Editorial data inserted successfully' as status;