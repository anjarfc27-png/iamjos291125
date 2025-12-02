-- Create site_plugins table
CREATE TABLE IF NOT EXISTS site_plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'generic',
  enabled BOOLEAN DEFAULT false,
  version TEXT DEFAULT '1.0.0',
  author TEXT DEFAULT 'Unknown',
  configurable BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT ON site_plugins TO anon;
GRANT ALL PRIVILEGES ON site_plugins TO authenticated;

-- Create or replace updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_plugins_updated_at 
  BEFORE UPDATE ON site_plugins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default plugins
INSERT INTO site_plugins (id, name, description, category, enabled, version, author, configurable) VALUES
  ('custom-block', 'Custom Block Manager', 'Kelola blok konten di sidebar.', 'generic', true, '1.2.0', 'PKP Team', true),
  ('google-analytics', 'Google Analytics', 'Tambahkan tracking Analytics.', 'generic', false, '2.1.3', 'PKP Team', true),
  ('crossref', 'Crossref XML Export', 'Ekspor metadata artikel ke Crossref XML.', 'importexport', true, '3.0.1', 'Crossref', false),
  ('doaj', 'DOAJ Export Plugin', 'Ekspor metadata ke DOAJ.', 'importexport', false, '1.5.2', 'DOAJ', false),
  ('orcid', 'ORCID Profile', 'Integrasi profil ORCID untuk author.', 'metadata', true, '1.8.0', 'ORCID', true),
  ('citation-style', 'Citation Style Language', 'Tampilkan kutipan dalam berbagai gaya.', 'metadata', true, '2.3.1', 'PKP Team', true),
  ('usage-stats', 'Usage Statistics', 'Lihat statistik penggunaan jurnal.', 'reports', false, '1.9.4', 'PKP Team', true)
ON CONFLICT (id) DO NOTHING;