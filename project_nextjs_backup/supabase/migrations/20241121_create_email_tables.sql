-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grant permissions
GRANT SELECT ON email_templates TO anon;
GRANT ALL PRIVILEGES ON email_templates TO authenticated;
GRANT SELECT ON email_logs TO anon;
GRANT ALL PRIVILEGES ON email_logs TO authenticated;

-- Create triggers for updated_at
CREATE TRIGGER update_email_templates_updated_at 
  BEFORE UPDATE ON email_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, body, description, category) VALUES
  ('review-notification', 'Pemberitahuan Review', 'Anda ditugaskan sebagai reviewer', 'Halo {{name}},

Anda telah ditugaskan sebagai reviewer untuk artikel "{{article_title}}" di jurnal {{journal_name}}.

Silakan login ke sistem untuk melihat detail dan melakukan review.

Terima kasih,
{{journal_name}}', 'Template untuk mengirim pemberitahuan ke reviewer', 'review'),
  
  ('publication-notification', 'Pemberitahuan Publikasi', 'Artikel Anda telah dipublikasikan', 'Halo {{name}},

Kami dengan senang hati menginformasikan bahwa artikel Anda dengan judul "{{article_title}}" telah berhasil dipublikasikan di jurnal {{journal_name}}.

Artikel dapat diakses melalui: {{article_url}}

Terima kasih atas kontribusi Anda.

{{journal_name}}', 'Template untuk mengirim pemberitahuan publikasi artikel', 'publication')
ON CONFLICT (id) DO NOTHING;