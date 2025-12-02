# Row Level Security (RLS) Guide

## Overview

Dokumen ini menjelaskan implementasi Row Level Security (RLS) untuk OJS Next.js project. RLS memastikan bahwa setiap user hanya dapat mengakses data yang sesuai dengan role dan permissions mereka.

## Security Model

### Multi-Tenancy
- **Site Level**: Site administrators memiliki akses penuh ke semua data
- **Journal Level**: Journal managers/editors hanya dapat mengakses data journal mereka
- **User Level**: Users hanya dapat mengakses data mereka sendiri

### Role Hierarchy
```
Site Admin (Highest)
  └─ Journal Manager
      └─ Editor / Section Editor
          └─ Reviewer / Author
              └─ Reader (Lowest)
```

## Helper Functions

### 1. `is_site_admin()`
**Purpose**: Check if current user is site administrator

**Usage**:
```sql
SELECT * FROM journals WHERE is_site_admin();
```

**Returns**: `BOOLEAN`

---

### 2. `has_journal_role(journal_id UUID, role_ids INTEGER[])`
**Purpose**: Check if user has specific role(s) in a journal

**Parameters**:
- `journal_id`: UUID of the journal
- `role_ids`: Array of role IDs to check

**Usage**:
```sql
SELECT * FROM submissions 
WHERE has_journal_role(context_id, ARRAY[16, 17]);
```

**Role IDs**:
- `16` = Manager
- `17` = Section Editor
- `4096` = Reviewer
- `4097` = Assistant
- `65536` = Author
- `1048576` = Reader

---

### 3. `is_journal_manager(journal_id UUID)`
**Purpose**: Check if user is manager of specific journal

**Usage**:
```sql
SELECT * FROM journal_settings 
WHERE is_journal_manager(journal_id);
```

---

### 4. `is_journal_editor(journal_id UUID)`
**Purpose**: Check if user is editor (Manager, Editor, or Section Editor)

**Usage**:
```sql
SELECT * FROM submissions 
WHERE is_journal_editor(context_id);
```

---

### 5. `is_assigned_to_submission(submission_id UUID)`
**Purpose**: Check if user is assigned to work on submission

**Usage**:
```sql
SELECT * FROM submissions 
WHERE is_assigned_to_submission(id);
```

---

### 6. `is_submission_author(submission_id UUID)`
**Purpose**: Check if user is author of submission

**Usage**:
```sql
SELECT * FROM submissions 
WHERE is_submission_author(id);
```

---

### 7. `is_submission_reviewer(submission_id UUID)`
**Purpose**: Check if user is assigned as reviewer

**Usage**:
```sql
SELECT * FROM submissions 
WHERE is_submission_reviewer(id);
```

## Policy Examples

### Users Table

**Policy**: Site admins have full access
```sql
CREATE POLICY "Site admins have full access to users"
  ON users FOR ALL
  USING (is_site_admin());
```

**Policy**: Users can view own profile
```sql
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());
```

**Policy**: Journal managers can view journal users
```sql
CREATE POLICY "Journal managers can view journal users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_user_groups uug
      JOIN user_groups ug ON uug.user_group_id = ug.id
      WHERE uug.user_id = users.id
      AND is_journal_manager(ug.context_id)
    )
  );
```

### Journals Table

**Policy**: Anyone can view enabled journals
```sql
CREATE POLICY "Anyone can view enabled journals"
  ON journals FOR SELECT
  USING (enabled = TRUE);
```

**Policy**: Journal managers can update their journals
```sql
CREATE POLICY "Journal managers can update their journals"
  ON journals FOR UPDATE
  USING (is_journal_manager(id));
```

### Submissions Table

**Policy**: Multiple access levels
```sql
-- Editors can view all journal submissions
CREATE POLICY "Journal editors can view journal submissions"
  ON submissions FOR SELECT
  USING (is_journal_editor(context_id));

-- Authors can view own submissions
CREATE POLICY "Authors can view own submissions"
  ON submissions FOR SELECT
  USING (is_submission_author(id));

-- Reviewers can view assigned submissions
CREATE POLICY "Reviewers can view assigned submissions"
  ON submissions FOR SELECT
  USING (is_submission_reviewer(id));
```

## Testing RLS Policies

### Test as Site Admin
```sql
-- Set user context
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "admin-user-id"}';

-- Should return all journals
SELECT * FROM journals;
```

### Test as Journal Manager
```sql
-- Set user context
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "manager-user-id"}';

-- Should return only managed journals
SELECT * FROM journals;
```

### Test as Author
```sql
-- Set user context
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "author-user-id"}';

-- Should return only own submissions
SELECT * FROM submissions;
```

## Bypassing RLS

### Service Role
The `service_role` can bypass all RLS policies for server-side operations:

```typescript
// Server-side code with service role
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// This bypasses RLS
const { data } = await supabase.from('users').select('*')
```

### When to Use Service Role
- ✅ Server Actions that need full access
- ✅ Background jobs and cron tasks
- ✅ Admin operations
- ✅ System-level operations
- ❌ Never expose service role key to client

## Security Best Practices

### 1. Always Use RLS
```sql
-- Enable RLS on all tables
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 2. Test Policies Thoroughly
- Test each role separately
- Test edge cases
- Test with real user IDs
- Test policy combinations

### 3. Use Helper Functions
- Centralize permission logic
- Easier to maintain
- Consistent across policies
- Better performance (cached)

### 4. Principle of Least Privilege
- Grant minimum necessary access
- Default to deny
- Explicit allow policies
- Separate read/write policies

### 5. Audit Regularly
```sql
-- Check tables without RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename 
  FROM pg_policies
);

-- Check policies per table
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

## Common Issues

### Issue 1: Policy Too Restrictive
**Symptom**: Users can't access data they should be able to

**Solution**: Check policy logic and helper functions
```sql
-- Debug: Check user roles
SELECT * FROM user_user_groups WHERE user_id = auth.uid();

-- Debug: Check journal access
SELECT is_journal_manager('journal-id');
```

### Issue 2: Policy Too Permissive
**Symptom**: Users can access data they shouldn't

**Solution**: Add more restrictive conditions
```sql
-- Bad: Too permissive
CREATE POLICY "Users can view submissions"
  ON submissions FOR SELECT
  USING (TRUE);

-- Good: Properly restricted
CREATE POLICY "Users can view submissions"
  ON submissions FOR SELECT
  USING (
    is_site_admin() OR
    is_journal_editor(context_id) OR
    is_submission_author(id)
  );
```

### Issue 3: Performance Issues
**Symptom**: Slow queries with RLS

**Solution**: 
1. Add indexes on columns used in policies
2. Optimize helper functions
3. Use `SECURITY DEFINER` for helper functions
4. Cache role checks

```sql
-- Add index for policy
CREATE INDEX idx_user_user_groups_user_context 
ON user_user_groups(user_id, user_group_id);
```

## Monitoring

### Check Active Policies
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check RLS Status
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Performance Monitoring
```sql
-- Check slow queries with RLS
SELECT 
  query,
  calls,
  total_time,
  mean_time
FROM pg_stat_statements
WHERE query LIKE '%FROM%'
ORDER BY mean_time DESC
LIMIT 10;
```

## Migration Checklist

Before applying RLS migration:
- [ ] Backup database
- [ ] Review all policies
- [ ] Test in development
- [ ] Verify helper functions work
- [ ] Check performance impact
- [ ] Document any custom policies

After applying RLS migration:
- [ ] Verify all tables have RLS enabled
- [ ] Test each role's access
- [ ] Monitor query performance
- [ ] Check application functionality
- [ ] Update documentation

## Support

For RLS issues:
1. Check this guide
2. Review policy definitions in `004_row_level_security.sql`
3. Test with SQL queries
4. Check Supabase logs
5. Contact development team
