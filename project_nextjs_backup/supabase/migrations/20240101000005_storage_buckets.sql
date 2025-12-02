-- Migration: Supabase Storage Buckets Configuration
-- Date: 2025-11-29
-- Description: Configure storage buckets for OJS file management

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Note: Supabase Storage buckets are created via API or Dashboard
-- This migration serves as documentation and can be used to create buckets via SQL
-- if Supabase adds support for bucket creation via SQL in the future.

-- Buckets needed for OJS:
-- 1. journals - Journal-specific files (logos, themes, uploaded files)
-- 2. users - User profile pictures and uploaded files
-- 3. plugins - Plugin files and assets
-- 4. temp - Temporary files (uploads in progress, etc.)
-- 5. public - Public files (published articles, images, etc.)

-- ============================================================================
-- STORAGE POLICIES (RLS for Storage)
-- ============================================================================

-- These policies should be created via Supabase Dashboard or API
-- Documentation: https://supabase.com/docs/guides/storage/security/access-control

-- Journals bucket policies:
-- - Public read access for published journal files
-- - Journal managers can upload/edit/delete files in their journal
-- - Site admins have full access

-- Users bucket policies:
-- - Users can read/update their own files
-- - Public read access for profile pictures
-- - Site admins have full access

-- Plugins bucket policies:
-- - Public read access
-- - Site admins can upload/edit/delete

-- Temp bucket policies:
-- - Users can upload to their own temp directory
-- - System can clean up old temp files
-- - Site admins have full access

-- Public bucket policies:
-- - Public read access
-- - Authenticated users can upload (depending on permissions)
-- - Site admins have full access

-- ============================================================================
-- STORAGE HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to journal bucket
CREATE OR REPLACE FUNCTION can_access_journal_bucket(journal_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Site admins can access all journals
  IF EXISTS (
    SELECT 1 FROM user_account_roles
    WHERE user_id = auth.uid()
    AND role_path = 'admin'
    AND context_id IS NULL
  ) THEN
    RETURN TRUE;
  END IF;

  -- Journal managers can access their journal
  IF EXISTS (
    SELECT 1 FROM user_user_groups uug
    JOIN user_groups ug ON uug.user_group_id = ug.id
    WHERE uug.user_id = auth.uid()
    AND ug.context_id = journal_id
    AND ug.role_id = 16 -- Manager role
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage path for journal
CREATE OR REPLACE FUNCTION get_journal_storage_path(journal_id UUID, filename TEXT)
RETURNS TEXT AS $$
DECLARE
  journal_path TEXT;
BEGIN
  SELECT path INTO journal_path FROM journals WHERE id = journal_id;
  IF journal_path IS NULL THEN
    RAISE EXCEPTION 'Journal not found: %', journal_id;
  END IF;
  
  RETURN journal_path || '/' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage path for user files
CREATE OR REPLACE FUNCTION get_user_storage_path(user_id UUID, filename TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'users/' || user_id::TEXT || '/' || filename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION can_access_journal_bucket(UUID) IS 'Check if current user can access journal bucket';
COMMENT ON FUNCTION get_journal_storage_path(UUID, TEXT) IS 'Get storage path for journal file';
COMMENT ON FUNCTION get_user_storage_path(UUID, TEXT) IS 'Get storage path for user file';