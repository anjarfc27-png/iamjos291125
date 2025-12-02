# Database Migrations

## Overview
This directory contains all database migrations for the OJS Next.js project. Migrations are numbered sequentially and should be applied in order.

## Migration Files

### 001_ojs_schema.sql
**Status**: ✅ Applied  
**Description**: Initial OJS 3.3 core schema
- Users & authentication
- Journals & contexts
- Submissions & publications
- Review system
- Issues & sections
- Navigation & content
- Email templates
- Files & library
- Payments

### 002_add_missing_ojs_tables.sql
**Status**: ✅ Ready  
**Description**: Add missing OJS 3.3 tables
- Queries & discussions
- Editorial decisions
- Stage assignments
- Publication galleys
- Authors & contributors
- Activity logging
- Email logging
- Notifications
- Scheduled tasks
- Citations
- Controlled vocabularies
- Temporary files
- Data tombstones

### 003_add_performance_indexes.sql
**Status**: ✅ Ready  
**Description**: Performance optimization indexes
- Composite indexes for common queries
- Full-text search indexes
- Partial indexes for filtered queries
- Query planner optimization

## How to Apply Migrations

### Using Supabase CLI

```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/002_add_missing_ojs_tables.sql
```

### Using Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Copy content from migration file
3. Execute SQL
4. Verify tables created successfully

### Using psql

```bash
# Connect to database
psql postgresql://[user]:[password]@[host]:[port]/[database]

# Apply migration
\i supabase/migrations/002_add_missing_ojs_tables.sql
```

## Migration Checklist

Before applying migrations:
- [ ] Backup database
- [ ] Review migration SQL
- [ ] Check for conflicts with existing schema
- [ ] Test in development environment first

After applying migrations:
- [ ] Verify all tables created
- [ ] Check indexes created
- [ ] Test queries performance
- [ ] Update schema documentation

## Rollback Strategy

If migration fails:
1. Restore from backup
2. Review error messages
3. Fix migration SQL
4. Re-apply migration

## Next Migrations

### 004_row_level_security.sql (Planned)
- RLS policies for all tables
- Security rules for multi-tenancy
- Admin access policies

### 005_helper_tables.sql (Planned)
- Site settings tables
- Plugin registry
- Cache tables

## Schema Verification

After applying all migrations, verify schema:

```bash
# Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

# Check all indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

# Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

## Troubleshooting

### Error: Table already exists
```sql
-- Use IF NOT EXISTS
CREATE TABLE IF NOT EXISTS table_name (...);
```

### Error: Index already exists
```sql
-- Use IF NOT EXISTS
CREATE INDEX IF NOT EXISTS index_name ON table_name(column);
```

### Error: Foreign key constraint fails
- Check referenced table exists
- Check referenced column exists
- Check data types match

## Contact

For migration issues, contact development team or check:
- `.kiro/specs/ojs-site-admin-100-percent-parity/`
- `SCHEMA_VERIFICATION.md`
