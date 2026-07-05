-- RV Armor: Tracking Schema Enhancements
-- Adds columns needed by the full waterfall attribution system

-- =============================================
-- VISITORS: additional attribution columns
-- =============================================
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS first_msclkid TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS first_ttclid TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS first_url_params JSONB DEFAULT '{}';
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS last_landing_page TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS last_utm_campaign TEXT;
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- SESSIONS: additional ad platform columns
-- =============================================
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS msclkid TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ttclid TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS li_fat_id TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS gbraid TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS wbraid TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS ad_click_data JSONB;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS url_params JSONB DEFAULT '{}';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS conversion_at TIMESTAMPTZ;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- PAGE_VIEWS: additional detail columns
-- =============================================
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS scroll_depth INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ DEFAULT NOW();

-- =============================================
-- JOURNEY_EVENTS: page path column
-- =============================================
ALTER TABLE journey_events ADD COLUMN IF NOT EXISTS page_path TEXT;

-- =============================================
-- ADDITIONAL RLS POLICIES
-- =============================================

-- Allow anon to read visitors by fingerprint (for tracking lookup)
CREATE POLICY "Anon can select visitors by fingerprint" ON visitors
  FOR SELECT USING (TRUE);

-- Allow anon to read sessions by id (for tracking lookup)
CREATE POLICY "Anon can select sessions by id" ON sessions
  FOR SELECT USING (TRUE);
