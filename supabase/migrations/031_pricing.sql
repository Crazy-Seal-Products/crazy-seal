-- ============================================================================
-- Pricing from material cost, with tiers.
--
-- price_book: one row per Shopify variant Crazy Seal sells: its material cost
--   and, optionally, its own markup. A variant's full price is
--   material_cost x (markup, or pricing_settings.default_markup). A variant
--   with no cost isn't priced by the quote builder.
-- pricing_tiers: discounts off the full price.
--   audience 'public':     volume tiers for the public quote builder; a quote
--                          gets the best active tier whose min_subtotal its
--                          full subtotal reaches.
--   audience 'contractor': the tier an admin assigns a contractor
--                          (contractors.pricing_tier_id); their quotes get it.
-- pricing_settings: one row (id = true) of settings: the default markup, the
--   follow-up offer (offer_discount_pct for offer_hours, after reminder_hours,
--   and whether it goes out on its own), when free shipping stops and freight
--   starts (free_shipping_under), when the builder asks for a phone number and
--   a ship-to address, whether the public builder is live, and the coverage
--   rates the roof-only builder uses to turn a roof into materials.
-- pricing_log: who changed a setting, a cost or a tier, and from what to what.
--
-- contractors.pricing_tier_id: the contractor's tier (audience 'contractor').
-- contractors.rep_id: the Crazy Seal sales rep who owns the account.
-- contractors.payment_terms: 'card' (pays at checkout) or 'terms' (invoiced;
--   their quotes go to staff instead of straight to checkout).
--
-- Service role only (see 029): RLS on, no policies.
--
-- Restored 2026-11-23 from the live database after the original file was lost
-- before it was committed. It matches what is live, so re-running it changes
-- nothing. Safe to re-run.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS pricing_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  default_markup NUMERIC(6,3) NOT NULL DEFAULT 2.000 CHECK (default_markup >= 1),
  offer_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 10 CHECK (offer_discount_pct >= 0 AND offer_discount_pct < 100),
  offer_hours INTEGER NOT NULL DEFAULT 72 CHECK (offer_hours >= 1 AND offer_hours <= 720),
  free_shipping_under NUMERIC(12,2) NOT NULL DEFAULT 3500 CHECK (free_shipping_under >= 0),
  capture_phone_at NUMERIC(12,2) NOT NULL DEFAULT 1000 CHECK (capture_phone_at >= 0),
  capture_address_at NUMERIC(12,2) NOT NULL DEFAULT 3500 CHECK (capture_address_at >= 0),
  reminder_hours INTEGER NOT NULL DEFAULT 24 CHECK (reminder_hours >= 0 AND reminder_hours <= 720),
  auto_reoffer BOOLEAN NOT NULL DEFAULT FALSE,
  public_builder_live BOOLEAN NOT NULL DEFAULT FALSE,
  coverage JSONB NOT NULL DEFAULT '{"coats": 2, "caulkSqftPerTube": 400, "patchFtPerGallon": 70, "cleanSqftPerGallon": 1000, "sealSqftPerGallonPerCoat": {"over-existing": 100, "direct-to-deck": 75}}',
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO pricing_settings (id) VALUES (TRUE) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS price_book (
  variant_id TEXT PRIMARY KEY,
  product_handle TEXT NOT NULL,
  title TEXT NOT NULL,
  material_cost NUMERIC(12,2) CHECK (material_cost IS NULL OR material_cost >= 0),
  markup NUMERIC(6,3) CHECK (markup IS NULL OR markup >= 1),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_price_book_handle ON price_book (product_handle);

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  audience TEXT NOT NULL CHECK (audience IN ('public', 'contractor')),
  discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_pct >= 0 AND discount_pct < 100),
  min_subtotal NUMERIC(12,2) CHECK (min_subtotal IS NULL OR min_subtotal >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pricing_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_email TEXT,
  actor_name TEXT,
  subject TEXT NOT NULL CHECK (subject IN ('settings', 'cost', 'tier')),
  subject_id TEXT,
  summary TEXT NOT NULL,
  changes JSONB
);
CREATE INDEX IF NOT EXISTS idx_pricing_log_at ON pricing_log (at DESC);

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS pricing_tier_id UUID;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS rep_id UUID;
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS payment_terms TEXT NOT NULL DEFAULT 'card';

DO $$
BEGIN
  ALTER TABLE contractors ADD CONSTRAINT contractors_payment_terms_check CHECK (payment_terms IN ('card', 'terms'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE contractors ADD CONSTRAINT contractors_pricing_tier_id_fkey
    FOREIGN KEY (pricing_tier_id) REFERENCES pricing_tiers(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER TABLE contractors ADD CONSTRAINT contractors_rep_id_fkey
    FOREIGN KEY (rep_id) REFERENCES sales_reps(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE pricing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_log ENABLE ROW LEVEL SECURITY;

COMMIT;
