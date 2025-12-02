-- Create site_bulk_emails table
CREATE TABLE IF NOT EXISTS site_bulk_emails (
  id TEXT PRIMARY KEY DEFAULT 'site',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT ON site_bulk_emails TO anon;
GRANT ALL PRIVILEGES ON site_bulk_emails TO authenticated;

-- Create or replace updated_at trigger (reuse existing function if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_bulk_emails_updated_at 
  BEFORE UPDATE ON site_bulk_emails 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default permissions
INSERT INTO site_bulk_emails (id, permissions) VALUES
  ('site', '[
    {"id": "jpk", "allow": true},
    {"id": "jsi", "allow": false},
    {"id": "education", "allow": false}
  ]'::jsonb)
ON CONFLICT (id) DO NOTHING;