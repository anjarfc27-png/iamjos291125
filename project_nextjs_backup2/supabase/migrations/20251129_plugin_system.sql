-- Create plugin_settings table to store configuration for plugins
CREATE TABLE IF NOT EXISTS public.plugin_settings (
    plugin_name text NOT NULL,
    journal_id uuid REFERENCES public.journals(id) ON DELETE CASCADE, -- Nullable for site-wide settings
    setting_name text NOT NULL,
    setting_value text, -- Can store JSON strings if needed
    setting_type text NOT NULL DEFAULT 'string', -- 'string', 'bool', 'int', 'object'
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (plugin_name, journal_id, setting_name)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS plugin_settings_journal_idx ON public.plugin_settings (journal_id);
CREATE INDEX IF NOT EXISTS plugin_settings_plugin_idx ON public.plugin_settings (plugin_name);

-- RLS Policies
ALTER TABLE public.plugin_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (public plugins might need settings)
CREATE POLICY "Plugin settings are viewable by everyone" 
ON public.plugin_settings FOR SELECT 
USING (true);

-- Allow write access only to admins and journal managers
CREATE POLICY "Admins and Managers can insert plugin settings" 
ON public.plugin_settings FOR INSERT 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.journal_user_roles 
    WHERE role IN ('admin', 'manager')
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_account_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins and Managers can update plugin settings" 
ON public.plugin_settings FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.journal_user_roles 
    WHERE role IN ('admin', 'manager')
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_account_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins and Managers can delete plugin settings" 
ON public.plugin_settings FOR DELETE 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.journal_user_roles 
    WHERE role IN ('admin', 'manager')
  ) OR 
  EXISTS (
    SELECT 1 FROM public.user_account_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
