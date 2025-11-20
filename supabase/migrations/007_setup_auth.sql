-- Migration: Setup Supabase Auth
-- Description: Setup Supabase Auth tables and integrate with OJS users

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth.users table if it doesn't exist (Supabase should create this automatically)
-- But we'll add some custom fields to link with OJS users

-- Add custom fields to auth.users to link with OJS users
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS ojs_user_id UUID REFERENCES users(user_id);

-- Create a function to sync OJS users with auth.users
CREATE OR REPLACE FUNCTION sync_ojs_user_to_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user already exists in auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = NEW.email) THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      ojs_user_id
    ) VALUES (
      gen_random_uuid(),
      NEW.email,
      crypt('password', gen_salt('bf')), -- Default password for testing
      NOW(),
      NOW(),
      NOW(),
      NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync users
DROP TRIGGER IF EXISTS sync_user_to_auth ON users;
CREATE TRIGGER sync_user_to_auth
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_ojs_user_to_auth();

-- Update existing users to have auth entries
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, ojs_user_id)
SELECT 
  gen_random_uuid(),
  email,
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  user_id
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = u.email);

-- Update passwords for test users to be 'password'
UPDATE auth.users 
SET encrypted_password = crypt('password', gen_salt('bf'))
WHERE email IN (
  'admin@example.com',
  'editor@example.com', 
  'sectioneditor@example.com',
  'assistant@example.com',
  'author@example.com',
  'reviewer@example.com',
  'reader@example.com',
  'subscription@example.com'
);