-- Create users table with different name to avoid schema cache issues
CREATE TABLE IF NOT EXISTS user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test users
INSERT INTO user_accounts (username, email, password, first_name, last_name) 
VALUES 
    ('admin', 'admin@example.com', 'password', 'Admin', 'User'),
    ('editor', 'editor@example.com', 'password', 'Editor', 'User'),
    ('author', 'author@example.com', 'password', 'Author', 'User')
ON CONFLICT (email) DO NOTHING;

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_account_roles (
    user_id UUID NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
    role_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert role data
INSERT INTO user_account_roles (user_id, role_name) 
SELECT id, 'Site admin' FROM user_accounts WHERE username = 'admin';

INSERT INTO user_account_roles (user_id, role_name) 
SELECT id, 'Editor' FROM user_accounts WHERE username = 'editor';

INSERT INTO user_account_roles (user_id, role_name) 
SELECT id, 'Author' FROM user_accounts WHERE username = 'author';