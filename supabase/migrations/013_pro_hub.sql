-- Crazy Seal Pro Hub: customer/dealer accounts (magic-link sessions, not
-- Supabase Auth). Pro users must NOT become `authenticated` role members
-- because existing RLS treats authenticated as staff.

CREATE TABLE IF NOT EXISTS pro_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  business_name TEXT,
  phone TEXT,
  shopify_customer_id TEXT,
  -- Staff can pin a status; otherwise status is derived from Shopify tags + volume.
  status_override TEXT,
  last_login_at TIMESTAMPTZ,
  last_magic_link_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  invited_by UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_users_shopify ON pro_users(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_pro_users_last_login ON pro_users(last_login_at DESC);

CREATE TABLE IF NOT EXISTS pro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pro_user_id UUID NOT NULL REFERENCES pro_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_sessions_user ON pro_sessions(pro_user_id);
CREATE INDEX IF NOT EXISTS idx_pro_sessions_expires ON pro_sessions(expires_at);

CREATE TABLE IF NOT EXISTS pro_magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_magic_links_email ON pro_magic_links(email);
CREATE INDEX IF NOT EXISTS idx_pro_magic_links_hash ON pro_magic_links(token_hash);

ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS filed_by_pro_user_id UUID REFERENCES pro_users(id),
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';

CREATE INDEX IF NOT EXISTS idx_warranty_reg_filed_by ON warranty_registrations(filed_by_pro_user_id);
CREATE INDEX IF NOT EXISTS idx_warranty_reg_installer_email ON warranty_registrations(installer_email);

ALTER TABLE pro_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_magic_links ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) bypasses RLS. No anon/authenticated policies:
-- hub data is only read through scoped API routes.
