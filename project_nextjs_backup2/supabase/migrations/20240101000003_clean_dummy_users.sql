-- OJS 3.3 Clean Dummy Data for Testing All Roles
-- Clean insert with proper UUID handling

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