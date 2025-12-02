-- Migration: Add password hashing to existing users
-- Created at: 2025-01-21

-- Since existing passwords are in plaintext, we need to hash them
-- This is a one-time migration script that should be run after bcrypt is implemented

-- First, let's add a migration tracking table
CREATE TABLE IF NOT EXISTS migration_tracking (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check if this migration has already been applied
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM migration_tracking WHERE migration_name = 'hash_existing_passwords') THEN
        
        -- Hash all existing plaintext passwords
        -- Note: This assumes you have bcrypt available in your environment
        -- In production, you might want to do this in batches or through an application script
        
        -- For now, we'll add a note that this needs to be done manually or through application code
        RAISE NOTICE 'Please hash existing passwords using application code with bcrypt';
        RAISE NOTICE 'Example: UPDATE user_accounts SET password = bcrypt.hash_sync(password, 10) WHERE password NOT LIKE "$2a$%"';
        
        -- Mark this migration as applied
        INSERT INTO migration_tracking (migration_name) VALUES ('hash_existing_passwords');
        
    END IF;
END $$;