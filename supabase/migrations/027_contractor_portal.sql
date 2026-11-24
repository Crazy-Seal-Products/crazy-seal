-- ============================================================================
-- Contractor portal: Thermo's partner portal brought over as the Crazy Seal
-- contractor portal. Each contractor (contractors row) is a company with a
-- team of Pro Hub accounts, and the team works its own customers, pipeline,
-- quotes to its customers, jobs on the roof and an activity log.
--
-- contractor_members: which Pro Hub account belongs to which contractor, and
--   its role there. One contractor per account (pro_user_id is the key).
--   Roles: owner, admin, sales_manager, sales_rep, operations (what each can
--   see and do is in src/lib/contractor/roles.ts). Status: active, invited,
--   disabled.
-- contractor_customers: the contractor's own customers (homeowners, RV owners,
--   building owners, property managers).
-- contractor_opportunities: the sales pipeline (lead, qualified, proposal,
--   negotiation, won, lost).
-- contractor_quotes: the contractor's quote to its own customer, materials and
--   labor (draft, sent, won, lost). Not the same as quotes (033), which is
--   Crazy Seal's price for materials.
-- contractor_jobs: installs on the roof, by step (Clean & prep through
--   Complete). Superseded for new work by contractor_projects (032), kept for
--   history.
-- contractor_activity: who did what in the contractor's portal, including
--   Crazy Seal staff opening it with View as.
-- contractor_lead_imports: which website quote requests (leads) have already
--   been copied into a contractor's customers and projects, so a lead is
--   imported once (see import_contractor_leads in 032).
--
-- The app reads and writes these with the service role only (see 029): RLS is
-- on and there are no policies.
--
-- Restored 2026-11-23 from the live database after the original file was lost
-- before it was committed. It matches what is live, so re-running it changes
-- nothing. Safe to re-run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS contractor_members (
  pro_user_id UUID PRIMARY KEY REFERENCES pro_users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'sales_manager', 'sales_rep', 'operations')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  title TEXT,
  invited_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_members_contractor ON contractor_members (contractor_id);

CREATE TABLE IF NOT EXISTS contractor_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_customers_contractor ON contractor_customers (contractor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contractor_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contractor_customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  sqft INTEGER,
  roof_type TEXT,
  source TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  expected_close DATE,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_opportunities_contractor ON contractor_opportunities (contractor_id, stage);

CREATE TABLE IF NOT EXISTS contractor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  customer_id UUID REFERENCES contractor_customers(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES contractor_opportunities(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  city TEXT,
  roof_type TEXT,
  color TEXT,
  sqft INTEGER NOT NULL DEFAULT 0,
  seams INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'won', 'lost')),
  lines JSONB NOT NULL DEFAULT '[]',
  material_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  labor_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  total NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_quotes_contractor ON contractor_quotes (contractor_id, created_at DESC);

CREATE TABLE IF NOT EXISTS contractor_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contractor_customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES contractor_quotes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  city TEXT,
  sqft INTEGER,
  roof_type TEXT,
  stage TEXT NOT NULL DEFAULT 'Clean & prep'
    CHECK (stage IN ('Clean & prep', 'Seams & details', 'First coat', 'Second coat', 'Warranty registration', 'Complete')),
  crew TEXT,
  start_date DATE,
  sales_rep_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  ops_lead_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_contractor ON contractor_jobs (contractor_id, stage);

CREATE TABLE IF NOT EXISTS contractor_activity (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT,
  entity TEXT NOT NULL,
  entity_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'sign_in', 'view_as', 'request')),
  summary TEXT NOT NULL,
  changes JSONB
);
CREATE INDEX IF NOT EXISTS idx_contractor_activity_contractor ON contractor_activity (contractor_id, at DESC);

CREATE TABLE IF NOT EXISTS contractor_lead_imports (
  lead_id UUID PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE contractor_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_lead_imports ENABLE ROW LEVEL SECURITY;

COMMIT;
