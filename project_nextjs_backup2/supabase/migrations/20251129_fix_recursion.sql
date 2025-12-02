-- Migration: Fix Infinite Recursion in user_account_roles
-- Date: 2025-11-29
-- Description: Break RLS recursion by using a security definer view for admin checks

-- 1. Create a secure view to lookup admins (runs as owner/postgres, bypassing RLS)
CREATE OR REPLACE VIEW admin_lookup WITH (security_invoker = false) AS 
SELECT user_id 
FROM user_account_roles 
WHERE role_path = 'admin';

-- Grant access to the view
GRANT SELECT ON admin_lookup TO authenticated;
GRANT SELECT ON admin_lookup TO service_role;

-- 2. Reset policies on user_account_roles
ALTER TABLE user_account_roles ENABLE ROW LEVEL SECURITY;

-- Drop ALL potential existing policies to avoid "already exists" errors
-- We try multiple variations of names just in case
DROP POLICY IF EXISTS "Users can view own roles" ON user_account_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_account_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_account_roles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_account_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_account_roles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON user_account_roles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_account_roles;
DROP POLICY IF EXISTS "policy_user_account_roles_select" ON user_account_roles;

-- Also drop unquoted versions if they exist (Postgres folds to lowercase)
DROP POLICY IF EXISTS admins_can_manage_roles ON user_account_roles;
DROP POLICY IF EXISTS users_can_view_own_roles ON user_account_roles;

-- 3. Create new safe policies

-- Policy: Users can see their own roles
CREATE POLICY "Users can view own roles"
ON user_account_roles FOR SELECT
USING (
  user_id = auth.uid()
);

-- Policy: Admins can see ALL roles (using the secure view to avoid recursion)
CREATE POLICY "Admins can view all roles"
ON user_account_roles FOR SELECT
USING (
  EXISTS (SELECT 1 FROM admin_lookup WHERE user_id = auth.uid())
);

-- Policy: Admins can manage roles
CREATE POLICY "Admins can manage roles"
ON user_account_roles FOR ALL
USING (
  EXISTS (SELECT 1 FROM admin_lookup WHERE user_id = auth.uid())
);

-- 4. Update is_site_admin function to use the view as well (optimization)
CREATE OR REPLACE FUNCTION is_site_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_lookup
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
