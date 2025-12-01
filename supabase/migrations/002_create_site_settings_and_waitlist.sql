-- Site settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
  ('bookings_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Waitlist table for users who want to be notified
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT waitlist_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_notified ON waitlist(notified_at) WHERE notified_at IS NULL;

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Settings: read-only for anon, full access for service role
CREATE POLICY "Allow public read settings" ON site_settings
  FOR SELECT USING (true);

-- Waitlist: anyone can insert, only service role can read/update
CREATE POLICY "Allow public insert waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

