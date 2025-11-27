-- Script untuk seed data dummy user ke Supabase
-- Jalankan di Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
--
-- ⚠️ AMAN: Script ini TIDAK akan menghapus data yang sudah ada!
-- Script menggunakan ON CONFLICT, jadi:
-- - Jika user sudah ada → akan UPDATE data (username, password, dll)
-- - Jika user belum ada → akan INSERT user baru
-- - Data lain yang tidak disebutkan di script TIDAK akan terhapus

-- Pastikan tabel sudah ada, jika belum buat dulu:
-- CREATE TABLE IF NOT EXISTS user_accounts (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   username VARCHAR(255) UNIQUE NOT NULL,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   password VARCHAR(255) NOT NULL,
--   first_name VARCHAR(255),
--   last_name VARCHAR(255),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- CREATE TABLE IF NOT EXISTS user_account_roles (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES user_accounts(id) ON DELETE CASCADE,
--   role_name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ⚠️ PERINGATAN: Baris di bawah ini DI-COMMENT (tidak aktif)
-- Jika Anda ingin menghapus semua data lama, uncomment baris di bawah:
-- (Tapi biasanya TIDAK PERLU, karena script sudah aman dengan ON CONFLICT)
-- DELETE FROM user_account_roles;
-- DELETE FROM user_accounts;

-- Insert dummy users dengan berbagai role
-- Password untuk semua user: "password123" (plain text untuk development)

-- 1. Site Admin
-- Update jika username atau email sudah ada, jika tidak insert baru
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Cek apakah user dengan username atau email sudah ada
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'admin' OR email = 'admin@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    -- Update user yang sudah ada (jangan ubah id jika berbeda)
    UPDATE user_accounts 
    SET 
      username = 'admin',
      email = 'admin@ojs.test',
      password = 'password123',
      first_name = 'Site',
      last_name = 'Administrator'
    WHERE id = existing_user_id;
    
    -- Update id di user_account_roles jika perlu
    UPDATE user_account_roles 
    SET user_id = existing_user_id 
    WHERE user_id = target_id;
  ELSE
    -- Insert user baru
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'admin', 'admin@ojs.test', 'password123', 'Site', 'Administrator')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk admin (jika belum ada)
-- Gunakan id yang sebenarnya dari database
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'admin' OR email = 'admin@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Site admin', 'admin', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Site admin'
    );
  END IF;
END $$;

-- 2. Editor
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'editor' OR email = 'editor@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    UPDATE user_accounts 
    SET 
      username = 'editor',
      email = 'editor@ojs.test',
      password = 'password123',
      first_name = 'John',
      last_name = 'Editor'
    WHERE id = existing_user_id;
  ELSE
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'editor', 'editor@ojs.test', 'password123', 'John', 'Editor')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk editor (jika belum ada)
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'editor' OR email = 'editor@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Editor', 'editor', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Editor'
    );
  END IF;
END $$;

-- 3. Author
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'author' OR email = 'author@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    UPDATE user_accounts 
    SET 
      username = 'author',
      email = 'author@ojs.test',
      password = 'password123',
      first_name = 'Jane',
      last_name = 'Author'
    WHERE id = existing_user_id;
  ELSE
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'author', 'author@ojs.test', 'password123', 'Jane', 'Author')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk author (jika belum ada)
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'author' OR email = 'author@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Author', 'author', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Author'
    );
  END IF;
END $$;

-- 4. Reviewer
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000004';
BEGIN
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'reviewer' OR email = 'reviewer@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    UPDATE user_accounts 
    SET 
      username = 'reviewer',
      email = 'reviewer@ojs.test',
      password = 'password123',
      first_name = 'Bob',
      last_name = 'Reviewer'
    WHERE id = existing_user_id;
  ELSE
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'reviewer', 'reviewer@ojs.test', 'password123', 'Bob', 'Reviewer')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk reviewer (jika belum ada)
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'reviewer' OR email = 'reviewer@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Reviewer', 'reviewer', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Reviewer'
    );
  END IF;
END $$;

-- 5. Reader
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000005';
BEGIN
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'reader' OR email = 'reader@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    UPDATE user_accounts 
    SET 
      username = 'reader',
      email = 'reader@ojs.test',
      password = 'password123',
      first_name = 'Alice',
      last_name = 'Reader'
    WHERE id = existing_user_id;
  ELSE
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'reader', 'reader@ojs.test', 'password123', 'Alice', 'Reader')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk reader (jika belum ada)
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'reader' OR email = 'reader@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Reader', 'reader', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Reader'
    );
  END IF;
END $$;

-- 6. Manager (bisa akses admin juga)
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000006';
BEGIN
  SELECT id INTO existing_user_id 
  FROM user_accounts 
  WHERE username = 'manager' OR email = 'manager@ojs.test' 
  LIMIT 1;
  
  IF existing_user_id IS NOT NULL THEN
    UPDATE user_accounts 
    SET 
      username = 'manager',
      email = 'manager@ojs.test',
      password = 'password123',
      first_name = 'Manager',
      last_name = 'User'
    WHERE id = existing_user_id;
  ELSE
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'manager', 'manager@ojs.test', 'password123', 'Manager', 'User')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
  END IF;
END $$;

-- Insert role untuk manager (jika belum ada)
DO $$
DECLARE
  actual_user_id UUID;
BEGIN
  SELECT id INTO actual_user_id 
  FROM user_accounts 
  WHERE username = 'manager' OR email = 'manager@ojs.test' 
  LIMIT 1;
  
  IF actual_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
    SELECT actual_user_id, 'Manager', 'manager', NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles 
      WHERE user_id = actual_user_id 
      AND role_name = 'Manager'
    );
  END IF;
END $$;

-- Sinkronkan user_accounts ke tabel OJS `users`
INSERT INTO users (id, username, email, password, first_name, last_name)
SELECT
  ua.id,
  ua.username,
  ua.email,
  ua.password,
  ua.first_name,
  ua.last_name
FROM user_accounts ua
WHERE NOT EXISTS (
  SELECT 1
  FROM users u
  WHERE u.id = ua.id
     OR u.username = ua.username
     OR u.email = ua.email
);

-- Contoh user multi-role (Author + Reviewer) di level site
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000010';
BEGIN
  SELECT id INTO existing_user_id
  FROM user_accounts
  WHERE username = 'multi_author_reviewer' OR email = 'multi_author_reviewer@ojs.test'
  LIMIT 1;

  IF existing_user_id IS NULL THEN
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'multi_author_reviewer', 'multi_author_reviewer@ojs.test', 'password123', 'Multi', 'AuthorReviewer')
    ON CONFLICT (id) DO UPDATE SET
      username = EXCLUDED.username,
      email = EXCLUDED.email,
      password = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name;
    existing_user_id := target_id;
  END IF;

  INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
  SELECT existing_user_id, 'Author', 'author', NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM user_account_roles
    WHERE user_id = existing_user_id AND role_name = 'Author'
  );

  INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
  SELECT existing_user_id, 'Reviewer', 'reviewer', NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM user_account_roles
    WHERE user_id = existing_user_id AND role_name = 'Reviewer'
  );
END $$;

-- Admin kedua (Site admin) tanpa mengubah admin yang sudah ada
DO $$
DECLARE
  existing_user_id UUID;
  target_id UUID := '00000000-0000-0000-0000-000000000021';
BEGIN
  SELECT id INTO existing_user_id
  FROM user_accounts
  WHERE username = 'admin2' OR email = 'admin2@ojs.test'
  LIMIT 1;

  IF existing_user_id IS NULL THEN
    INSERT INTO user_accounts (id, username, email, password, first_name, last_name)
    VALUES (target_id, 'admin2', 'admin2@ojs.test', 'password123', 'Second', 'Administrator')
    ON CONFLICT (id) DO UPDATE SET
      username  = EXCLUDED.username,
      email     = EXCLUDED.email,
      password  = EXCLUDED.password,
      first_name = EXCLUDED.first_name,
      last_name  = EXCLUDED.last_name;
    existing_user_id := target_id;
  END IF;

  INSERT INTO user_account_roles (user_id, role_name, role_path, context_id)
  SELECT existing_user_id, 'Site admin', 'admin', NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM user_account_roles
    WHERE user_id = existing_user_id AND role_name = 'Site admin'
  );
END $$;

-- Seed minimal 2 jurnal hosted untuk pengujian multi-journal
DO $$
DECLARE
  j1_id journals.id%TYPE;
  j2_id journals.id%TYPE;
BEGIN
  -- Journal pertama
  INSERT INTO journals (path, enabled, primary_locale, seq)
  SELECT 'demo-journal-1', 1, 'en_US', 1
  WHERE NOT EXISTS (SELECT 1 FROM journals WHERE path = 'demo-journal-1')
  RETURNING id INTO j1_id;

  IF j1_id IS NULL THEN
    SELECT id INTO j1_id FROM journals WHERE path = 'demo-journal-1' LIMIT 1;
  END IF;

  IF j1_id IS NOT NULL THEN
    INSERT INTO journal_settings (journal_id, locale, setting_name, setting_value, setting_type)
    SELECT j1_id, 'en_US', 'name', 'Demo Journal 1', 'string'
    WHERE NOT EXISTS (
      SELECT 1 FROM journal_settings
      WHERE journal_id = j1_id AND setting_name = 'name' AND locale = 'en_US'
    );
  END IF;

  -- Journal kedua
  INSERT INTO journals (path, enabled, primary_locale, seq)
  SELECT 'demo-journal-2', 1, 'en_US', 2
  WHERE NOT EXISTS (SELECT 1 FROM journals WHERE path = 'demo-journal-2')
  RETURNING id INTO j2_id;

  IF j2_id IS NULL THEN
    SELECT id INTO j2_id FROM journals WHERE path = 'demo-journal-2' LIMIT 1;
  END IF;

  IF j2_id IS NOT NULL THEN
    INSERT INTO journal_settings (journal_id, locale, setting_name, setting_value, setting_type)
    SELECT j2_id, 'en_US', 'name', 'Demo Journal 2', 'string'
    WHERE NOT EXISTS (
      SELECT 1 FROM journal_settings
      WHERE journal_id = j2_id AND setting_name = 'name' AND locale = 'en_US'
    );
  END IF;
END $$;

-- Verifikasi data
SELECT 
  ua.id,
  ua.username,
  ua.email,
  ua.first_name,
  ua.last_name,
  STRING_AGG(uar.role_name, ', ') as roles
FROM user_accounts ua
LEFT JOIN user_account_roles uar ON ua.id = uar.user_id
GROUP BY ua.id, ua.username, ua.email, ua.first_name, ua.last_name
ORDER BY ua.username;

