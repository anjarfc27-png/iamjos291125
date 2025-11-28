-- Fix missing user roles
-- Run this in Supabase SQL Editor

-- 1. Site Admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'admin';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Site admin', 'admin'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Site admin'
    );
  END IF;
END $$;

-- 2. Manager
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'manager';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Manager', 'manager'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Manager'
    );
  END IF;
END $$;

-- 3. Editor
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'editor';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Editor', 'editor'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Editor'
    );
  END IF;
END $$;

-- 4. Author
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'author';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Author', 'author'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Author'
    );
  END IF;
END $$;

-- 5. Reviewer
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'reviewer';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Reviewer', 'reviewer'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Reviewer'
    );
  END IF;
END $$;

-- 6. Reader
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM user_accounts WHERE username = 'reader';
  IF target_user_id IS NOT NULL THEN
    INSERT INTO user_account_roles (user_id, role_name, role_path)
    SELECT target_user_id, 'Reader', 'reader'
    WHERE NOT EXISTS (
      SELECT 1 FROM user_account_roles WHERE user_id = target_user_id AND role_name = 'Reader'
    );
  END IF;
END $$;
