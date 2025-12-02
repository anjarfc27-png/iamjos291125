-- OJS 3.3 Dummy Data for Testing All Roles
-- Comprehensive test data for Site Admin, Manager, Editor, Sub Editor, Assistant, Author, Reviewer, Reader

-- Site Admin User (Role: Site Admin - Application Level)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000001', 'siteadmin', 'siteadmin@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Site', 'Administrator', 'SA', 'Indonesia', '+62-21-12345678', 'Jl. Pendidikan No. 123, Jakarta', NOW(), NOW());

-- Manager Users (Role: Journal Manager)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000002', 'manager1', 'manager1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Budi', 'Santoso', 'BS', 'Indonesia', '+62-21-87654321', 'Jl. Manajemen No. 45, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000003', 'editor1', 'editor1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Siti', 'Rahayu', 'SR', 'Indonesia', '+62-21-23456789', 'Jl. Editor No. 67, Jakarta', NOW(), NOW());

-- Sub Editor Users (Role: Section Editor)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000004', 'sectioneditor1', 'sectioneditor1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dewi', 'Wijaya', 'DW', 'Indonesia', '+62-21-34567890', 'Jl. Bagian No. 89, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000005', 'guesteditor1', 'guesteditor1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmad', 'Pratama', 'AP', 'Indonesia', '+62-21-45678901', 'Jl. Tamu No. 12, Jakarta', NOW(), NOW());

-- Assistant Users (Role: Copyeditor, Designer, Proofreader, etc.)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000006', 'copyeditor1', 'copyeditor1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rina', 'Sari', 'RS', 'Indonesia', '+62-21-56789012', 'Jl. Salin No. 34, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000007', 'designer1', 'designer1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andi', 'Kurniawan', 'AK', 'Indonesia', '+62-21-67890123', 'Jl. Desain No. 56, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000008', 'proofreader1', 'proofreader1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lina', 'Permata', 'LP', 'Indonesia', '+62-21-78901234', 'Jl. Koreksi No. 78, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000009', 'layouteditor1', 'layouteditor1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bambang', 'Setiawan', 'BS', 'Indonesia', '+62-21-89012345', 'Jl. Tata Letak No. 90, Jakarta', NOW(), NOW());

-- Author Users (Role: Author)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000010', 'author1', 'author1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Citra', 'Lestari', 'CL', 'Indonesia', '+62-21-90123456', 'Jl. Penulis No. 11, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000011', 'author2', 'author2@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dian', 'Purnama', 'DP', 'Indonesia', '+62-21-01234567', 'Jl. Penulis No. 22, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000012', 'author3', 'author3@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Eko', 'Susanto', 'ES', 'Indonesia', '+62-21-12345679', 'Jl. Penulis No. 33, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000013', 'translator1', 'translator1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fitri', 'Anggraeni', 'FA', 'Indonesia', '+62-21-23456780', 'Jl. Terjemahan No. 44, Jakarta', NOW(), NOW());

-- Reviewer Users (Role: Reviewer)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000014', 'reviewer1', 'reviewer1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Galih', 'Ramadhan', 'GR', 'Indonesia', '+62-21-34567891', 'Jl. Reviewer No. 55, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000015', 'reviewer2', 'reviewer2@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hana', 'Julianti', 'HJ', 'Indonesia', '+62-21-45678902', 'Jl. Reviewer No. 66, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000016', 'reviewer3', 'reviewer3@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Indra', 'Kusuma', 'IK', 'Indonesia', '+62-21-56789013', 'Jl. Reviewer No. 77, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000017', 'reviewer4', 'reviewer4@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joko', 'Widodo', 'JW', 'Indonesia', '+62-21-67890124', 'Jl. Reviewer No. 88, Jakarta', NOW(), NOW());

-- Reader Users (Role: Reader)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000018', 'reader1', 'reader1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kartika', 'Sari', 'KS', 'Indonesia', '+62-21-78901235', 'Jl. Pembaca No. 99, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000019', 'reader2', 'reader2@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lukman', 'Hakim', 'LH', 'Indonesia', '+62-21-89012346', 'Jl. Pembaca No. 100, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000020', 'reader3', 'reader3@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maya', 'Anggriani', 'MA', 'Indonesia', '+62-21-90123457', 'Jl. Pembaca No. 111, Jakarta', NOW(), NOW());

-- Subscription Manager Users (Role: Subscription Manager)
INSERT INTO users (id, username, email, password, first_name, last_name, initials, country, phone, mailing_address, date_registered, date_validated) VALUES
('00000000-0000-0000-0000-000000000021', 'subscription1', 'subscription1@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nina', 'Kusuma', 'NK', 'Indonesia', '+62-21-01234568', 'Jl. Langganan No. 122, Jakarta', NOW(), NOW()),
('00000000-0000-0000-0000-000000000022', 'subscription2', 'subscription2@ojs.local', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Omar', 'Setiawan', 'OS', 'Indonesia', '+62-21-12345680', 'Jl. Langganan No. 133, Jakarta', NOW(), NOW());

-- Assign users to user groups (roles)
-- Site Admin (role_id = 1) - handled at application level, not in user_groups

-- Journal Manager (role_id = 16)
WITH manager_group AS (SELECT id FROM user_groups WHERE role_id = 16 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000002'::uuid, manager_group.id FROM manager_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000003'::uuid, manager_group.id FROM manager_group;

-- Section Editor (role_id = 17)
WITH section_editor_group AS (SELECT id FROM user_groups WHERE role_id = 17 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000004'::uuid, section_editor_group.id FROM section_editor_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000005'::uuid, section_editor_group.id FROM section_editor_group;

-- Assistant (role_id = 4097)
WITH assistant_group AS (SELECT id FROM user_groups WHERE role_id = 4097 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000006'::uuid, assistant_group.id FROM assistant_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000007'::uuid, assistant_group.id FROM assistant_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000008'::uuid, assistant_group.id FROM assistant_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000009'::uuid, assistant_group.id FROM assistant_group;

-- Author (role_id = 65536)
WITH author_group AS (SELECT id FROM user_groups WHERE role_id = 65536 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000010'::uuid, author_group.id FROM author_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000011'::uuid, author_group.id FROM author_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000012'::uuid, author_group.id FROM author_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000013'::uuid, author_group.id FROM author_group;

-- Reviewer (role_id = 4096)
WITH reviewer_group AS (SELECT id FROM user_groups WHERE role_id = 4096 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000014'::uuid, reviewer_group.id FROM reviewer_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000015'::uuid, reviewer_group.id FROM reviewer_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000016'::uuid, reviewer_group.id FROM reviewer_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000017'::uuid, reviewer_group.id FROM reviewer_group;

-- Reader (role_id = 1048576)
WITH reader_group AS (SELECT id FROM user_groups WHERE role_id = 1048576 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000018'::uuid, reader_group.id FROM reader_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000019'::uuid, reader_group.id FROM reader_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000020'::uuid, reader_group.id FROM reader_group;

-- Subscription Manager (role_id = 2097152)
WITH subscription_group AS (SELECT id FROM user_groups WHERE role_id = 2097152 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id) 
SELECT '00000000-0000-0000-0000-000000000021'::uuid, subscription_group.id FROM subscription_group
UNION ALL
SELECT '00000000-0000-0000-0000-000000000022'::uuid, subscription_group.id FROM subscription_group;

-- Insert user settings
INSERT INTO user_settings (user_id, setting_name, setting_value, setting_type, locale) VALUES
-- Site Admin settings
('00000000-0000-0000-0000-000000000001', 'affiliation', 'OJS Site Administration', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000001', 'biography', 'Site Administrator for OJS 3.3 System', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000001', 'signature', 'Best regards, Site Admin', 'string', 'en_US'),

-- Manager settings
('00000000-0000-0000-0000-000000000002', 'affiliation', 'Universitas Indonesia, Jakarta', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000002', 'biography', 'Journal Manager with 10 years experience', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000002', 'signature', 'Best regards, Budi Santoso', 'string', 'en_US'),

('00000000-0000-0000-0000-000000000003', 'affiliation', 'Institut Teknologi Bandung', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000003', 'biography', 'Senior Editor specializing in technology', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000003', 'signature', 'Best regards, Siti Rahayu', 'string', 'en_US'),

-- Section Editor settings
('00000000-0000-0000-0000-000000000004', 'affiliation', 'Universitas Gadjah Mada', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000004', 'biography', 'Section Editor for Computer Science', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000004', 'signature', 'Best regards, Dewi Wijaya', 'string', 'en_US'),

-- Assistant settings
('00000000-0000-0000-0000-000000000006', 'affiliation', 'Universitas Airlangga', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000006', 'biography', 'Professional Copyeditor', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000006', 'signature', 'Best regards, Rina Sari', 'string', 'en_US'),

-- Author settings
('00000000-0000-0000-0000-000000000010', 'affiliation', 'Universitas Brawijaya', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000010', 'biography', 'Researcher in Machine Learning', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000010', 'signature', 'Best regards, Citra Lestari', 'string', 'en_US'),

-- Reviewer settings
('00000000-0000-0000-0000-000000000014', 'affiliation', 'Universitas Diponegoro', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000014', 'biography', 'Expert in Artificial Intelligence', 'string', 'en_US'),
('00000000-0000-0000-0000-000000000014', 'signature', 'Best regards, Galih Ramadhan', 'string', 'en_US');

-- Insert journal settings
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO journal_settings (journal_id, setting_name, setting_value, setting_type, locale) 
SELECT j.id, 'name', 'Jurnal Teknologi Informasi dan Sains', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'description', 'Jurnal ilmiah bidang teknologi informasi dan sains komputer', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'contactName', 'Editorial Office', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'contactEmail', 'editor@jti.example.com', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'supportName', 'Technical Support', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'supportEmail', 'support@jti.example.com', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'abbreviation', 'J. Teknol. Inf. dan Sains', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'printIssn', '1234-5678', 'string', 'en_US' FROM journal j
UNION ALL
SELECT j.id, 'onlineIssn', '8765-4321', 'string', 'en_US' FROM journal j;

-- Insert journal managers and editors
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1),
     manager_role AS (SELECT ug.id FROM user_groups ug, journal j WHERE ug.context_id = j.id AND ug.role_id = 16 LIMIT 1),
     editor_role AS (SELECT ug.id FROM user_groups ug, journal j WHERE ug.context_id = j.id AND ug.role_id = 17 LIMIT 1)
INSERT INTO user_user_groups (user_id, user_group_id)
SELECT '00000000-0000-0000-0000-000000000002'::uuid, manager_role.id FROM journal, manager_role
UNION ALL
SELECT '00000000-0000-0000-0000-000000000003'::uuid, editor_role.id FROM journal, editor_role;

-- Insert dummy submissions for testing
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1),
     author1 AS (SELECT id FROM users WHERE username = 'author1' LIMIT 1),
     author2 AS (SELECT id FROM users WHERE username = 'author2' LIMIT 1),
     author3 AS (SELECT id FROM users WHERE username = 'author3' LIMIT 1)
INSERT INTO submissions (id, journal_id, user_id, context_id, submission_progress, status, stage_id, date_submitted, date_status_modified, last_modified) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM journal), (SELECT id FROM author1), (SELECT id FROM journal), 0, 1, 1, NOW(), NOW(), NOW()),
('10000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM journal), (SELECT id FROM author2), (SELECT id FROM journal), 0, 1, 1, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('10000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM journal), (SELECT id FROM author3), (SELECT id FROM journal), 0, 1, 1, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('10000000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM journal), (SELECT id FROM author1), (SELECT id FROM journal), 0, 3, 3, NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),
('10000000-0000-0000-0000-000000000005'::uuid, (SELECT id FROM journal), (SELECT id FROM author2), (SELECT id FROM journal), 0, 5, 5, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days');

-- Insert publications for submissions
INSERT INTO publications (id, submission_id, journal_id, date_published, status, version, primary_contact_id, seq) VALUES
('20000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000001'::uuid, (SELECT id FROM journals LIMIT 1), NULL, 0, 1, (SELECT id FROM users WHERE username = 'author1' LIMIT 1), 1),
('20000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000002'::uuid, (SELECT id FROM journals LIMIT 1), NULL, 0, 1, (SELECT id FROM users WHERE username = 'author2' LIMIT 1), 1),
('20000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000003'::uuid, (SELECT id FROM journals LIMIT 1), NULL, 0, 1, (SELECT id FROM users WHERE username = 'author3' LIMIT 1), 1),
('20000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000004'::uuid, (SELECT id FROM journals LIMIT 1), NOW() - INTERVAL '21 days', 3, 1, (SELECT id FROM users WHERE username = 'author1' LIMIT 1), 1),
('20000000-0000-0000-0000-000000000005'::uuid, '10000000-0000-0000-0000-000000000005'::uuid, (SELECT id FROM journals LIMIT 1), NOW() - INTERVAL '30 days', 3, 1, (SELECT id FROM users WHERE username = 'author2' LIMIT 1), 1);

-- Insert publication settings (titles, abstracts, etc.)
INSERT INTO publication_settings (publication_id, setting_name, setting_value, setting_type, locale) VALUES
('20000000-0000-0000-0000-000000000001', 'title', 'Implementasi Machine Learning untuk Prediksi Cuaca di Indonesia', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000001', 'abstract', 'Penelitian ini mengembangkan sistem prediksi cuaca menggunakan algoritma machine learning untuk meningkatkan akurasi prediksi cuaca di wilayah Indonesia. Studi ini menggunakan data historis cuaca dari BMKG selama 5 tahun terakhir.', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000001', 'prefix', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000001', 'subtitle', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000001', 'pages', '1-15', 'string', 'en_US'),

('20000000-0000-0000-0000-000000000002', 'title', 'Analisis Kinerja Sistem Terdistribusi pada Platform E-Commerce', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000002', 'abstract', 'Studi ini menganalisis kinerja sistem terdistribusi dalam menangani beban tinggi pada platform e-commerce. Metodologi penelitian melibatkan pengujian skalabilitas dan keandalan sistem.', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000002', 'prefix', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000002', 'subtitle', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000002', 'pages', '16-30', 'string', 'en_US'),

('20000000-0000-0000-0000-000000000003', 'title', 'Pengembangan Framework Aplikasi Mobile Cross-Platform', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000003', 'abstract', 'Paper ini membahas pengembangan framework baru untuk aplikasi mobile yang dapat berjalan di multiple platform. Framework ini menawarkan performa optimal dan pengalaman pengguna yang konsisten.', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000003', 'prefix', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000003', 'subtitle', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000003', 'pages', '31-45', 'string', 'en_US'),

('20000000-0000-0000-0000-000000000004', 'title', 'Optimasi Algoritma Deep Learning untuk Pengenalan Pola', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000004', 'abstract', 'Penelitian ini mengoptimasi algoritma deep learning untuk meningkatkan akurasi pengenalan pola pada citra digital. Hasil menunjukkan peningkatan signifikan dibandingkan metode konvensional.', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000004', 'prefix', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000004', 'subtitle', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000004', 'pages', '46-60', 'string', 'en_US'),

('20000000-0000-0000-0000-000000000005', 'title', 'Keamanan Siber pada Internet of Things (IoT)', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000005', 'abstract', 'Artikel ini mengeksplorasi tantangan keamanan siber dalam implementasi Internet of Things dan mengusulkan solusi untuk mengatasi kerentanan sistem.', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000005', 'prefix', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000005', 'subtitle', '', 'string', 'en_US'),
('20000000-0000-0000-0000-000000000005', 'pages', '61-75', 'string', 'en_US');

-- Insert authors for publications
INSERT INTO authors (id, publication_id, email, include_in_browse, seq) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'author1@ojs.local', true, 1),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'author2@ojs.local', true, 1),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'author3@ojs.local', true, 1),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'author1@ojs.local', true, 1),
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'author2@ojs.local', true, 1);

-- Insert author settings
INSERT INTO author_settings (author_id, setting_name, setting_value, setting_type, locale) VALUES
('30000000-0000-0000-0000-000000000001', 'givenName', 'Citra', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000001', 'familyName', 'Lestari', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000001', 'affiliation', 'Universitas Brawijaya', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000001', 'country', 'Indonesia', 'string', 'en_US'),

('30000000-0000-0000-0000-000000000002', 'givenName', 'Dian', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000002', 'familyName', 'Purnama', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000002', 'affiliation', 'Institut Teknologi Sepuluh Nopember', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000002', 'country', 'Indonesia', 'string', 'en_US'),

('30000000-0000-0000-0000-000000000003', 'givenName', 'Eko', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000003', 'familyName', 'Susanto', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000003', 'affiliation', 'Universitas Gadjah Mada', 'string', 'en_US'),
('30000000-0000-0000-0000-000000000003', 'country', 'Indonesia', 'string', 'en_US');

-- Insert review assignments for testing
WITH submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1),
     reviewer1 AS (SELECT id FROM users WHERE username = 'reviewer1' LIMIT 1),
     reviewer2 AS (SELECT id FROM users WHERE username = 'reviewer2' LIMIT 1),
     reviewer3 AS (SELECT id FROM users WHERE username = 'reviewer3' LIMIT 1),
     editor1 AS (SELECT id FROM users WHERE username = 'editor1' LIMIT 1)
INSERT INTO review_assignments (id, submission_id, reviewer_id, editor_id, review_round_id, stage_id, review_method, round, step, review_type, date_assigned, date_due, date_response_due, last_modified, reminder_was_automatic, cancelled, declined, replaced, reviewer_file_id, quality, date_completed, date_acknowledged, date_confirmed, date_reminded, date_notified, consider_review) VALUES
('40000000-0000-0000-0000-000000000001', (SELECT id FROM submission1), (SELECT id FROM reviewer1), (SELECT id FROM editor1), 1, 3, 1, 1, 1, 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '5 days', 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1),
('40000000-0000-0000-0000-000000000002', (SELECT id FROM submission1), (SELECT id FROM reviewer2), (SELECT id FROM editor1), 1, 3, 1, 1, 1, 1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '3 days', NOW() - INTERVAL '5 days', 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1),
('40000000-0000-0000-0000-000000000003', (SELECT id FROM submission2), (SELECT id FROM reviewer3), (SELECT id FROM editor1), 1, 3, 1, 1, 1, 1, NOW() - INTERVAL '3 days', NOW() + INTERVAL '12 days', NOW() + INTERVAL '5 days', NOW() - INTERVAL '3 days', 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 1);

-- Insert review rounds
WITH submission1 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000001' LIMIT 1),
     submission2 AS (SELECT id FROM submissions WHERE id = '10000000-0000-0000-0000-000000000002' LIMIT 1)
INSERT INTO review_rounds (id, submission_id, stage_id, round, status, date_status_modified) VALUES
(1, (SELECT id FROM submission1), 3, 1, 0, NOW() - INTERVAL '5 days'),
(2, (SELECT id FROM submission2), 3, 1, 0, NOW() - INTERVAL '3 days');

-- Insert categories for testing
WITH journal AS (SELECT id FROM journals WHERE path = 'default-journal' LIMIT 1)
INSERT INTO categories (id, journal_id, parent_id, path, seq, is_visible) VALUES
('50000000-0000-0000-0000-000000000001', (SELECT id FROM journal), NULL, 'computer-science', 1, true),
('50000000-0000-0000-0000-000000000002', (SELECT id FROM journal), NULL, 'artificial-intelligence', 2, true),
('50000000-0000-0000-0000-000000000003', (SELECT id FROM journal), NULL, 'information-systems', 3, true),
('50000000-0000-0000-0000-000000000004', (SELECT id FROM journal), NULL, 'software-engineering', 4, true);

-- Insert category settings
INSERT INTO category_settings (category_id, setting_name, setting_value, setting_type, locale) VALUES
('50000000-0000-0000-0000-000000000001', 'title', 'Computer Science', 'string', 'en_US'),
('50000000-0000-0000-0000-000000000001', 'description', 'Articles related to computer science research', 'string', 'en_US'),

('50000000-0000-0000-0000-000000000002', 'title', 'Artificial Intelligence', 'string', 'en_US'),
('50000000-0000-0000-0000-000000000002', 'description', 'Research on AI and machine learning', 'string', 'en_US'),

('50000000-0000-0000-0000-000000000003', 'title', 'Information Systems', 'string', 'en_US'),
('50000000-0000-0000-0000-000000000003', 'description', 'Information systems and technology', 'string', 'en_US'),

('50000000-0000-0000-0000-000000000004', 'title', 'Software Engineering', 'string', 'en_US'),
('50000000-0000-0000-0000-000000000004', 'description', 'Software development and engineering', 'string', 'en_US');

-- Link submissions to categories
INSERT INTO submission_categories (submission_id, category_id) VALUES
('10000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003');