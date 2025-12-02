-- Migration: Create Storage Buckets Data
-- Date: 2025-11-29
-- Description: Insert actual bucket definitions into storage.buckets

-- 1. Journals Bucket (Public assets for journals like logos, covers)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'journals',
  'journals',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'text/css']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Submissions Bucket (Private, secured by RLS)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submissions',
  'submissions',
  false, -- Private
  104857600, -- 100MB
  NULL -- Allow all types (controlled by application logic)
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Temporary Bucket (Private, for uploads in progress)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'temporary',
  'temporary',
  false, -- Private
  104857600, -- 100MB
  NULL
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4. Public Bucket (Site-wide public assets)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  10485760, -- 10MB
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
