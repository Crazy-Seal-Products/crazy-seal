-- RV Armor Initial Schema
-- Tables: staff, visitors, sessions, page_views, journey_events, leads, faq_items, gallery_images

-- =============================================
-- ADMIN
-- =============================================

CREATE TABLE staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ATTRIBUTION & TRACKING
-- =============================================

CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  first_landing_page TEXT,
  first_referrer TEXT,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_term TEXT,
  first_utm_content TEXT,
  first_gclid TEXT,
  first_fbclid TEXT,
  last_utm_source TEXT,
  last_utm_medium TEXT,
  session_count INTEGER DEFAULT 1,
  total_pageviews INTEGER DEFAULT 0,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitors_fingerprint ON visitors(fingerprint);

CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id),
  landing_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  fbclid TEXT,
  device_type TEXT,
  browser TEXT,
  pageview_count INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT FALSE,
  conversion_type TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_visitor ON sessions(visitor_id);

CREATE TABLE page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  visitor_id UUID REFERENCES visitors(id),
  page_path TEXT NOT NULL,
  page_title TEXT,
  view_order INTEGER DEFAULT 0,
  time_on_page_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pageviews_session ON page_views(session_id);
CREATE INDEX idx_pageviews_visitor ON page_views(visitor_id);

CREATE TABLE journey_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES visitors(id),
  session_id UUID REFERENCES sessions(id),
  lead_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journey_visitor ON journey_events(visitor_id);
CREATE INDEX idx_journey_type ON journey_events(event_type);

-- =============================================
-- LEADS
-- =============================================

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  rv_year TEXT,
  rv_make TEXT,
  rv_model TEXT,
  rv_length TEXT,
  location TEXT,
  message TEXT,
  source_page TEXT,
  -- Linking to attribution
  visitor_id UUID REFERENCES visitors(id),
  session_id UUID REFERENCES sessions(id),
  -- First-touch (waterfalled from visitor)
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_gclid TEXT,
  first_fbclid TEXT,
  first_landing_page TEXT,
  first_referrer TEXT,
  first_seen_at TIMESTAMPTZ,
  -- Last-touch (from converting session)
  converting_utm_source TEXT,
  converting_utm_medium TEXT,
  converting_landing_page TEXT,
  -- Zoho sync status
  zoho_lead_id TEXT,
  zoho_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_visitor ON leads(visitor_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- =============================================
-- CONTENT
-- =============================================

CREATE TABLE faq_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  anchor_id TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  s3_key TEXT NOT NULL,
  cdn_url TEXT NOT NULL,
  category TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read on content tables
CREATE POLICY "Public can read active FAQ items" ON faq_items
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Public can read active gallery images" ON gallery_images
  FOR SELECT USING (is_active = TRUE);

-- Anonymous visitors can insert tracking data
CREATE POLICY "Anon can insert visitors" ON visitors
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can update own visitor" ON visitors
  FOR UPDATE USING (TRUE);

CREATE POLICY "Anon can insert sessions" ON sessions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can update own session" ON sessions
  FOR UPDATE USING (TRUE);

CREATE POLICY "Anon can insert page views" ON page_views
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can insert journey events" ON journey_events
  FOR INSERT WITH CHECK (TRUE);

-- Leads: insert only (no public read/update/delete)
CREATE POLICY "Anon can insert leads" ON leads
  FOR INSERT WITH CHECK (TRUE);

-- Staff: only authenticated staff can read
CREATE POLICY "Staff can read staff" ON staff
  FOR SELECT USING (auth.uid() = auth_user_id);
