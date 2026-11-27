-- ============================================================================
-- Roofs: Thermo's roof-asset platform in the contractor portal (Portfolio,
-- Roof assets, Inspections, Estimates, Budget & planning, Documents under
-- /portal/roofs/). A contractor keeps a record of every building its
-- customers own and every roof on it: what's on the roof, how it's holding
-- up, what's wrong with it, what fixing it would cost and when the money is
-- planned. Ported from thermo-materials
-- supabase/migrations/20261123000000_roof_asset_platform.sql, scoped to a
-- contractor instead of a dealer.
--
-- Every table belongs to one contractor (contractor_id, deleted with it) and
-- has created_by (the Pro Hub account that added the row), assigned_to (the
-- team member responsible for it) and created_at / updated_at (set by the
-- app). Sales reps see a building when it's assigned to them or they added
-- it, and a roof when they can see its building or the roof itself is
-- theirs; everything on a roof goes with the roof (src/lib/contractor/roofs.ts).
--
-- roof_facilities: a building. customer_id is the contractor's customer who
--   owns it (contractor_customers; kept when the customer is deleted, as no
--   owner). name, street, city, state, zip, notes.
-- roof_assets: one roof (or roof section) on a building; deleted with the
--   building. tag: the contractor's asset tag ("R-1001"), unique per
--   contractor. name ("Main roof", "Office annex"). roof_type (the portal's
--   roof types), system (the Crazy Seal system on it now, or the original
--   roof), area_sqft, slope ('Low slope', 'Steep slope'), deck ('Steel',
--   'Concrete', 'Wood', 'Gypsum', 'Unknown'), year_installed.
--   condition_score 0-100 from the latest inspection (80+ good, 60-79 fair,
--   40-59 poor, under 40 critical; empty until the first inspection).
--   last_inspected_on / next_inspection_on. warranty_registration_id: its
--   Crazy Seal warranty registration. project_id: the contractor project
--   (contractor_projects) that did the work. notes.
-- roof_inspections: an inspection of a roof, deleted with the roof. kind
--   ('Routine', 'Leak response', 'Pre-job', 'Closeout', 'Warranty'),
--   inspected_on, inspector_id (the team member who walked it),
--   condition_score 0-100 recorded that day, summary (findings and next
--   steps). Recording one sets the roof's condition_score and
--   last_inspected_on when it's the roof's latest inspection.
-- roof_deficiencies: a problem on a roof (a leak, open seam, failed flashing
--   ...), deleted with the roof. inspection_id: the inspection that found it
--   (kept as none when that inspection is deleted). title, location (where on
--   the roof), severity ('critical', 'high', 'medium', 'low'), status
--   ('open', 'scoped' into an estimate, 'scheduled' when that estimate is
--   approved, 'resolved', or 'monitor' to watch it), est_cost (dollars),
--   notes.
-- roof_estimates: what fixing a roof would cost the customer, deleted with
--   the roof. number ("E-1001"), unique per contractor. scenario ('repair'
--   the listed problems, 'restore' the roof with Crazy Seal, 'replace' it).
--   amount (dollars), status draft -> sent -> approved or declined.
--   deficiency_ids: the roof's deficiencies it covers. budget_year: the year
--   the customer expects to pay for it. assumptions: scope and assumptions.
--   quote_id: the Crazy Seal materials quote (quotes, 033) priced for it,
--   kept as none when that quote is deleted. approved_at: when the customer's
--   answer (approved or declined) was recorded; approval_note: what they
--   said.
-- roof_plans: the roof's multi-year budget plan, one row per planned item,
--   deleted with the roof. year, action ('Inspect', 'Maintain', 'Repair',
--   'Restore', 'Replace', 'Monitor'), est_cost (dollars), status
--   ('proposed', 'approved', 'funded', 'done', 'deferred'), notes.
-- roof_documents: a file kept for a building, a roof and/or a project
--   (facility_id, roof_asset_id, project_id; each link becomes none when what
--   it points to is deleted, so the file's record stays). title, kind
--   ('Warranty', 'Inspection report', 'Photo set', 'Spec', 'Invoice',
--   'Other'). The file goes from the browser straight to the media bucket
--   (presigned PUT, like project photos) under
--   user-uploads/roof-docs/<contractor id>/<ms>-<random>-<file name>:
--   s3_key (unique), url (its CDN address), mime, bytes. uploaded_by: the
--   Pro Hub account that uploaded the file.
--
-- Service role only (see 029): RLS on, no policies. Additive and safe to
-- re-run. The Roofs pages show a "being set up" note until it's applied
-- (and the API's schema cache has reloaded, which the NOTIFY at the end asks
-- for).
--
-- Applied to the live database 2026-11-23.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS roof_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contractor_customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  street TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roof_facilities_contractor ON roof_facilities (contractor_id, name);
CREATE INDEX IF NOT EXISTS idx_roof_facilities_customer ON roof_facilities (customer_id) WHERE customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS roof_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES roof_facilities(id) ON DELETE CASCADE,
  tag TEXT NOT NULL CHECK (length(btrim(tag)) BETWEEN 1 AND 40),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 160),
  roof_type TEXT,
  system TEXT,
  area_sqft INTEGER CHECK (area_sqft IS NULL OR area_sqft >= 0),
  slope TEXT CHECK (slope IS NULL OR slope IN ('Low slope', 'Steep slope')),
  deck TEXT CHECK (deck IS NULL OR deck IN ('Steel', 'Concrete', 'Wood', 'Gypsum', 'Unknown')),
  year_installed INTEGER CHECK (year_installed IS NULL OR year_installed BETWEEN 1900 AND 2100),
  condition_score INTEGER CHECK (condition_score IS NULL OR condition_score BETWEEN 0 AND 100),
  last_inspected_on DATE,
  next_inspection_on DATE,
  warranty_registration_id UUID REFERENCES warranty_registrations(id) ON DELETE SET NULL,
  project_id UUID REFERENCES contractor_projects(id) ON DELETE SET NULL,
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roof_assets_tag ON roof_assets (contractor_id, lower(tag));
CREATE INDEX IF NOT EXISTS idx_roof_assets_facility ON roof_assets (facility_id);
CREATE INDEX IF NOT EXISTS idx_roof_assets_next_inspection ON roof_assets (contractor_id, next_inspection_on);
CREATE INDEX IF NOT EXISTS idx_roof_assets_project ON roof_assets (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roof_assets_warranty ON roof_assets (warranty_registration_id) WHERE warranty_registration_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS roof_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  roof_asset_id UUID NOT NULL REFERENCES roof_assets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'Routine'
    CHECK (kind IN ('Routine', 'Leak response', 'Pre-job', 'Closeout', 'Warranty')),
  inspected_on DATE NOT NULL,
  inspector_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  condition_score INTEGER CHECK (condition_score IS NULL OR condition_score BETWEEN 0 AND 100),
  summary TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roof_inspections_contractor ON roof_inspections (contractor_id, inspected_on DESC);
CREATE INDEX IF NOT EXISTS idx_roof_inspections_roof ON roof_inspections (roof_asset_id, inspected_on DESC);

CREATE TABLE IF NOT EXISTS roof_deficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  roof_asset_id UUID NOT NULL REFERENCES roof_assets(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES roof_inspections(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 160),
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'scoped', 'scheduled', 'resolved', 'monitor')),
  est_cost NUMERIC(14,2) CHECK (est_cost IS NULL OR est_cost >= 0),
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roof_deficiencies_contractor ON roof_deficiencies (contractor_id, status);
CREATE INDEX IF NOT EXISTS idx_roof_deficiencies_roof ON roof_deficiencies (roof_asset_id);
CREATE INDEX IF NOT EXISTS idx_roof_deficiencies_inspection ON roof_deficiencies (inspection_id) WHERE inspection_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS roof_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  roof_asset_id UUID NOT NULL REFERENCES roof_assets(id) ON DELETE CASCADE,
  number TEXT NOT NULL CHECK (length(btrim(number)) BETWEEN 1 AND 40),
  scenario TEXT NOT NULL CHECK (scenario IN ('repair', 'restore', 'replace')),
  amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'declined')),
  deficiency_ids UUID[] NOT NULL DEFAULT '{}',
  budget_year INTEGER CHECK (budget_year IS NULL OR budget_year BETWEEN 2000 AND 2100),
  assumptions TEXT,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_note TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_roof_estimates_number ON roof_estimates (contractor_id, number);
CREATE INDEX IF NOT EXISTS idx_roof_estimates_contractor ON roof_estimates (contractor_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roof_estimates_roof ON roof_estimates (roof_asset_id);
CREATE INDEX IF NOT EXISTS idx_roof_estimates_quote ON roof_estimates (quote_id) WHERE quote_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS roof_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  roof_asset_id UUID NOT NULL REFERENCES roof_assets(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year BETWEEN 2000 AND 2100),
  action TEXT NOT NULL CHECK (action IN ('Inspect', 'Maintain', 'Repair', 'Restore', 'Replace', 'Monitor')),
  est_cost NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (est_cost >= 0),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'funded', 'done', 'deferred')),
  notes TEXT,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roof_plans_contractor ON roof_plans (contractor_id, year);
CREATE INDEX IF NOT EXISTS idx_roof_plans_roof ON roof_plans (roof_asset_id, year);

CREATE TABLE IF NOT EXISTS roof_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES roof_facilities(id) ON DELETE SET NULL,
  roof_asset_id UUID REFERENCES roof_assets(id) ON DELETE SET NULL,
  project_id UUID REFERENCES contractor_projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  kind TEXT NOT NULL DEFAULT 'Other'
    CHECK (kind IN ('Warranty', 'Inspection report', 'Photo set', 'Spec', 'Invoice', 'Other')),
  s3_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime TEXT,
  bytes BIGINT CHECK (bytes IS NULL OR bytes >= 0),
  uploaded_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_roof_documents_contractor ON roof_documents (contractor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roof_documents_facility ON roof_documents (facility_id) WHERE facility_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roof_documents_roof ON roof_documents (roof_asset_id) WHERE roof_asset_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_roof_documents_project ON roof_documents (project_id) WHERE project_id IS NOT NULL;

ALTER TABLE roof_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE roof_documents ENABLE ROW LEVEL SECURITY;

COMMIT;

-- So the API sees the new tables right away.
NOTIFY pgrst, 'reload schema';
