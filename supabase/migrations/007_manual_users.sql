-- Manual create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    initials VARCHAR(10),
    salutation VARCHAR(40),
    suffix VARCHAR(40),
    country VARCHAR(90),
    phone VARCHAR(24),
    mailing_address TEXT,
    billing_address TEXT,
    must_change_password BOOLEAN DEFAULT false,
    auth_id BIGINT,
    auth_string TEXT,
    disabled BOOLEAN DEFAULT false,
    date_last_login TIMESTAMP WITH TIME ZONE,
    date_registered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_validated TIMESTAMP WITH TIME ZONE,
    date_last_email TIMESTAMP WITH TIME ZONE,
    inline_help BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test admin user
INSERT INTO users (username, email, password, first_name, last_name) 
VALUES ('admin', 'admin@example.com', 'password', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert test editor user
INSERT INTO users (username, email, password, first_name, last_name) 
VALUES ('editor', 'editor@example.com', 'password', 'Editor', 'User')
ON CONFLICT (email) DO NOTHING;

-- Insert test author user
INSERT INTO users (username, email, password, first_name, last_name) 
VALUES ('author', 'author@example.com', 'password', 'Author', 'User')
ON CONFLICT (email) DO NOTHING;