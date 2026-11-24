-- ============================================================================
-- Contractor projects: one record per roof a contractor works, from the first
-- request through the order, the install and the warranty.
--
-- contractor_projects: stage lead -> quoted -> won -> ordered -> in_progress
--   -> complete (or lost). While in progress, install_step says where the crew
--   is (clean_prep, seams, first_coat, second_coat). site holds the address.
--   Quotes for the project's materials (quotes.project_id, 033), its Shopify
--   orders (contractor_project_orders), its warranty registration and claims
--   (warranty_*.project_id) and its photos (media_assets, 033) hang off it.
-- contractor_project_orders: Shopify orders that belong to a project, linked
--   by the quote that produced them ('quote') or by hand (a person's email).
--
-- warranty_registrations / warranty_claims gain the project and contractor
-- they were filed for, and where they came from (web, portal, admin). A
-- project has at most one warranty registration. warranty_claims.notified_status
-- is the last status the customer was emailed about, so a status is sent once.
--
-- import_contractor_leads(contractor): copies the contractor's website quote
-- requests (leads.contractor_id) that haven't been imported yet into their
-- customers and projects, assigned to the contractor's owner, with an activity
-- line each. Returns how many it imported. Runs when a contractor's portal
-- loads; each lead is imported once (contractor_lead_imports).
--
-- Service role only (see 029): RLS on, no policies; the function is callable
-- by the service role only.
--
-- Restored 2026-11-23 from the live database after the original file was lost
-- before it was committed. It matches what is live, so re-running it changes
-- nothing. Safe to re-run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS contractor_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contractor_customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead'
    CHECK (stage IN ('lead', 'quoted', 'won', 'ordered', 'in_progress', 'complete', 'lost')),
  install_step TEXT CHECK (install_step IN ('clean_prep', 'seams', 'first_coat', 'second_coat')),
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  roof_type TEXT,
  sqft INTEGER,
  seams INTEGER,
  color TEXT,
  site JSONB,
  source TEXT,
  crew TEXT,
  start_date DATE,
  completed_on DATE,
  expected_close DATE,
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  ops_lead_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_projects_contractor ON contractor_projects (contractor_id, stage, updated_at DESC);

CREATE TABLE IF NOT EXISTS contractor_project_orders (
  project_id UUID NOT NULL REFERENCES contractor_projects(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  linked_by TEXT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, shopify_order_id)
);
CREATE INDEX IF NOT EXISTS idx_contractor_project_orders_order ON contractor_project_orders (shopify_order_id);

-- Warranty registrations and claims filed for a project.
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS filed_by_pro_user_id UUID REFERENCES pro_users(id);
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web';
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE warranty_registrations ADD COLUMN IF NOT EXISTS contractor_id UUID;

ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS contractor_id UUID;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS filed_by_pro_user_id UUID;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web';
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
ALTER TABLE warranty_claims ADD COLUMN IF NOT EXISTS notified_status TEXT;

DO $$
BEGIN
  ALTER TABLE warranty_registrations ADD CONSTRAINT warranty_registrations_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES contractor_projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE warranty_registrations ADD CONSTRAINT warranty_registrations_contractor_id_fkey
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES contractor_projects(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_contractor_id_fkey
    FOREIGN KEY (contractor_id) REFERENCES contractors(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_filed_by_pro_user_id_fkey
    FOREIGN KEY (filed_by_pro_user_id) REFERENCES pro_users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE warranty_claims ADD CONSTRAINT warranty_claims_source_check CHECK (source IN ('web', 'portal', 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_warranty_reg_filed_by ON warranty_registrations (filed_by_pro_user_id);
CREATE INDEX IF NOT EXISTS idx_warranty_registrations_project ON warranty_registrations (project_id) WHERE project_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_warranty_registrations_one_per_project ON warranty_registrations (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warranty_claims_contractor ON warranty_claims (contractor_id) WHERE contractor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_warranty_claims_project ON warranty_claims (project_id) WHERE project_id IS NOT NULL;

ALTER TABLE contractor_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_project_orders ENABLE ROW LEVEL SECURITY;

-- Website quote requests -> the contractor's customers and projects.
CREATE OR REPLACE FUNCTION import_contractor_leads(p_contractor UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $function$
DECLARE
  n INT := 0;
  r RECORD;
  owner UUID;
  cust UUID;
  size_text TEXT;
  sqft_num INT;
  note TEXT;
BEGIN
  SELECT pro_user_id INTO owner FROM contractor_members
    WHERE contractor_id = p_contractor AND role = 'owner' AND status = 'active'
    ORDER BY created_at LIMIT 1;

  FOR r IN
    SELECT l.id, l.name, l.email, l.phone, l.location, l.rv_length, l.square_footage, l.message, l.project_type, l.created_at
    FROM leads l
    WHERE l.contractor_id = p_contractor
      AND NOT EXISTS (SELECT 1 FROM contractor_lead_imports i WHERE i.lead_id = l.id)
    ORDER BY l.created_at
    LIMIT 500
  LOOP
    INSERT INTO contractor_lead_imports (lead_id, contractor_id) VALUES (r.id, p_contractor)
      ON CONFLICT (lead_id) DO NOTHING;
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    size_text := COALESCE(NULLIF(r.square_footage, ''), NULLIF(r.rv_length, ''));
    sqft_num := NULLIF(SUBSTRING(REPLACE(COALESCE(r.square_footage, ''), ',', '') FROM '(\d+)'), '')::INT;
    note := NULLIF(TRIM(REGEXP_REPLACE(COALESCE(r.message, ''), '^Quote request for .*?\(contractor page\)\.\s*', '')), '');

    INSERT INTO contractor_customers (contractor_id, name, type, contact_name, email, phone, zip, notes, assigned_to, lead_id, created_at)
    VALUES (
      p_contractor,
      r.name,
      CASE WHEN r.project_type = 'Commercial' THEN 'Building owner' ELSE 'RV owner' END,
      r.name,
      r.email,
      r.phone,
      CASE WHEN r.location ~ '^\d{5}$' THEN r.location END,
      note,
      owner,
      r.id,
      r.created_at
    )
    RETURNING id INTO cust;

    INSERT INTO contractor_projects (contractor_id, customer_id, lead_id, name, stage, sqft, roof_type, source, notes, site, assigned_to, created_at, updated_at)
    VALUES (
      p_contractor,
      cust,
      r.id,
      r.name || ': ' || CASE WHEN r.project_type = 'Commercial' THEN 'roof' ELSE 'RV roof' END
        || CASE WHEN size_text IS NOT NULL THEN ' (' || size_text || ')' ELSE '' END,
      'lead',
      sqft_num,
      CASE WHEN r.project_type = 'Commercial' THEN 'Commercial roof' ELSE 'RV roof' END,
      'Crazy Seal page',
      note,
      CASE WHEN r.location ~ '^\d{5}$' THEN jsonb_build_object('zip', r.location) END,
      owner,
      r.created_at,
      r.created_at
    );

    INSERT INTO contractor_activity (at, contractor_id, actor_name, entity, entity_id, action, summary)
    VALUES (r.created_at, p_contractor, 'Crazy Seal website', 'projects', r.id::TEXT, 'request',
            'Quote request from ' || r.name || ' on your Crazy Seal page');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$function$;

REVOKE ALL ON FUNCTION import_contractor_leads(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION import_contractor_leads(UUID) TO service_role;

COMMIT;
