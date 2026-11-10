-- ============================================================================
-- Contractors: the certified dealers who install Crazy Seal. Each one gets a
-- white-label page at /contractor/<slug> and a pin on the contractor maps
-- (the admin's Dealers → Contractors, and the public /contractor finder).
--
-- zip_centroids: one point per ZIP from the Census Bureau's 2024 ZCTA
-- Gazetteer (public domain), plus one per 3-digit prefix (the average of its
-- ZIPs) for ZIPs with no ZCTA of their own. Loaded by
-- scripts/load-zip-centroids.mjs. A contractor's pin is their ZIP's center,
-- never their street address, and visitors search by ZIP against it.
--
-- Add-only: two new tables, nothing existing changes. RLS on with no
-- policies, so only server code using the service-role key can read or write
-- them. Safe to re-run.
-- ============================================================================

CREATE TABLE IF NOT EXISTS zip_centroids (
  zip TEXT PRIMARY KEY CHECK (zip ~ '^[0-9]{3}([0-9]{2})?$'),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL
);

ALTER TABLE zip_centroids ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- The page address, /contractor/<slug>. Set once; changing it breaks links.
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  segment TEXT NOT NULL DEFAULT 'rv' CHECK (segment IN ('rv', 'commercial')),
  company TEXT,
  first_name TEXT,
  goes_by TEXT,
  last_name TEXT,
  phone TEXT,
  phone_alt TEXT,
  email TEXT,
  -- Admin only. Public pages show city and state.
  street TEXT,
  city TEXT,
  state TEXT CHECK (state ~ '^[A-Z]{2}$'),
  zip TEXT CHECK (zip ~ '^[0-9]{5}$'),
  -- States they cover, home state first.
  service_states TEXT[] NOT NULL DEFAULT '{}',
  service_mode TEXT CHECK (service_mode IN ('shop', 'mobile', 'both')),
  -- Notes from the dealer list. Admin only.
  notes TEXT,
  -- White label: a preset palette (src/lib/contractors/theme.ts), optional
  -- custom colors over it, their logo and a tagline.
  theme TEXT NOT NULL DEFAULT 'seal',
  color_primary TEXT CHECK (color_primary ~ '^#[0-9a-f]{6}$'),
  color_accent TEXT CHECK (color_accent ~ '^#[0-9a-f]{6}$'),
  logo_url TEXT CHECK (logo_url ~ '^https://'),
  tagline TEXT,
  -- Off hides their page and their pin everywhere public.
  is_listed BOOLEAN NOT NULL DEFAULT TRUE,
  -- Which dealer-list row this came from, so a re-import updates it in place
  -- (scripts/import-contractors.mjs).
  import_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractors_listed ON contractors(is_listed);

ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
