-- Admin-managed redirects, applied by src/proxy.ts at request time so
-- new redirects work without a deploy. Code-defined redirects stay in
-- src/lib/redirects.ts (compiled into next.config).
CREATE TABLE managed_redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT UNIQUE NOT NULL,        -- path, e.g. /old-page
  destination TEXT NOT NULL,          -- path or absolute URL
  permanent BOOLEAN DEFAULT TRUE,     -- 301 vs 302
  enabled BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE managed_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read enabled redirects" ON managed_redirects
  FOR SELECT USING (enabled = TRUE);

CREATE POLICY "Authenticated can manage redirects" ON managed_redirects
  FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
