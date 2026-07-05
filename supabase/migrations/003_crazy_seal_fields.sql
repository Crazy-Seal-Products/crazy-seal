-- Crazy Seal: lead fields from Gravity Forms + business/dealer inquiries

-- =============================================
-- LEADS: fields from the Crazy Seal contact/quote forms
-- =============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS project_type TEXT;        -- RV Roof / Other
ALTER TABLE leads ADD COLUMN IF NOT EXISTS rv_length TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS square_footage TEXT;      -- bucketed ranges from form
ALTER TABLE leads ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS texting_consent BOOLEAN DEFAULT false;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS wp_entry_id TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_ip TEXT;
-- Business/dealer inquiry fields
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS business_type TEXT;       -- Dealership / Mobile Tech / Sole Proprietor / Influencer / etc.
ALTER TABLE leads ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'quote';  -- quote | business | contact

CREATE INDEX IF NOT EXISTS idx_leads_wp_entry ON leads(wp_entry_id);
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);

-- =============================================
-- WARRANTY REGISTRATIONS
-- =============================================
CREATE TABLE warranty_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Customer
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  customer_details TEXT,               -- business name etc.
  -- Order / install
  order_number TEXT,
  install_type TEXT,                   -- diy | dealer_installed
  installer_name TEXT,
  installer_phone TEXT,
  installer_email TEXT,
  -- Photos (required before/after)
  photo_urls JSONB DEFAULT '[]',       -- S3 user-uploads/warranty/... or legacy gravity-forms/...
  -- Notes + consent
  experience_notes TEXT,
  contractor_notes TEXT,
  warranty_consent BOOLEAN DEFAULT false,
  photo_display_consent BOOLEAN DEFAULT true,
  -- Legacy import linkage
  gf_entry_id INTEGER,
  wp_form_id INTEGER,
  -- Status / admin
  status TEXT DEFAULT 'submitted',     -- submitted | approved | flagged
  reviewed_by UUID REFERENCES staff(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  -- Attribution
  visitor_id UUID REFERENCES visitors(id),
  session_id UUID REFERENCES sessions(id),
  -- Zoho sync
  zoho_record_id TEXT,
  zoho_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warranty_reg_email ON warranty_registrations(email);
CREATE INDEX idx_warranty_reg_order ON warranty_registrations(order_number);
CREATE INDEX idx_warranty_reg_created ON warranty_registrations(created_at DESC);
CREATE INDEX idx_warranty_reg_gf_entry ON warranty_registrations(gf_entry_id) WHERE gf_entry_id IS NOT NULL;

-- =============================================
-- WARRANTY TRANSFERS
-- =============================================
CREATE TABLE warranty_transfers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  new_owner_name TEXT NOT NULL,
  new_owner_email TEXT NOT NULL,
  new_owner_phone TEXT,
  original_owner_name TEXT,
  original_owner_email TEXT,
  order_number TEXT,
  transfer_notes TEXT,
  warranty_registration_id UUID REFERENCES warranty_registrations(id),
  gf_entry_id INTEGER,
  status TEXT DEFAULT 'submitted',
  reviewed_by UUID REFERENCES staff(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warranty_transfers_order ON warranty_transfers(order_number);

-- =============================================
-- WARRANTY CLAIMS
-- =============================================
CREATE TABLE warranty_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  order_number TEXT,
  failure_description TEXT,
  photo_urls JSONB DEFAULT '[]',
  warranty_registration_id UUID REFERENCES warranty_registrations(id),
  gf_entry_id INTEGER,
  status TEXT DEFAULT 'submitted',     -- submitted | in_review | resolved | denied
  resolution_notes TEXT,
  reviewed_by UUID REFERENCES staff(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_warranty_claims_order ON warranty_claims(order_number);

-- =============================================
-- CONTENT REQUESTS (Business Accelerator resources)
-- =============================================
CREATE TABLE content_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  cloud_file_link TEXT,
  file_urls JSONB DEFAULT '[]',
  description TEXT,
  status TEXT DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- LEGACY GRAVITY FORMS ENTRIES (raw import archive)
-- =============================================
CREATE TABLE legacy_gf_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gf_entry_id INTEGER NOT NULL,
  gf_form_id INTEGER NOT NULL,
  form_title TEXT,
  entry_data JSONB NOT NULL DEFAULT '{}',
  file_urls JSONB DEFAULT '[]',        -- rewritten to media.crazyseal.com
  submitted_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (gf_form_id, gf_entry_id)
);

CREATE INDEX idx_legacy_gf_form ON legacy_gf_entries(gf_form_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE warranty_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_gf_entries ENABLE ROW LEVEL SECURITY;

-- Public may only insert (all reads happen server-side with the secret key)
CREATE POLICY "Anon can insert warranty registrations" ON warranty_registrations
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can insert warranty transfers" ON warranty_transfers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can insert warranty claims" ON warranty_claims
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Anon can insert content requests" ON content_requests
  FOR INSERT WITH CHECK (TRUE);
