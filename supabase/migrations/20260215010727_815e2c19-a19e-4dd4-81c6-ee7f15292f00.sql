-- Settings table for app configuration (key-value store)
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);

-- Anyone can update settings (admin-only page)
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);

-- Anyone can insert settings
CREATE POLICY "Anyone can insert settings" ON public.settings FOR INSERT WITH CHECK (true);

-- Seed the default WhatsApp number
INSERT INTO public.settings (key, value) VALUES ('whatsapp_number', '212600000000');