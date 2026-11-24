-- ============================================================================
-- Quotes: Crazy Seal's priced materials for a roof, from the public quote
-- builder, a contractor's portal or an admin, through checkout and the order.
--
-- quotes: number (Q-1001...), token (the buyer's private link), audience
--   ('public' or 'contractor'), source ('builder', 'portal', 'admin').
--   inputs: what the roof is (the builder's answers). lines: the priced
--   materials (variant, quantity, unit full price, unit price, line total).
--   subtotal_full is the list price, discount_pct/discount_total the tier
--   (tier_id, tier_name) or follow-up offer, shipping 'free' or 'freight',
--   total what the buyer pays. cost_total is Crazy Seal's material cost, for
--   staff only. expires_at: prices are held until then; a new revision
--   reprices. missing: what the builder still needs before checkout (phone,
--   ship-to address). price_override: a staff override and its reason.
--   proposal: the contractor's proposal to their own customer built on it.
--   status open -> checkout -> ordered (or lost / cancelled). handoff: why a
--   quote went to staff instead of straight to checkout (freight, terms,
--   no_access, incomplete). Checkout is a Shopify draft order (its id,
--   invoice_url and the revision it was made from); reminder_sent_at,
--   reoffered_at and viewed_at drive the follow-ups.
-- quote_events: the quote's history (created, priced, viewed, checkout,
--   reminder, offer, ordered, duplicate_order, lost, ...).
-- link_quote_order(): when a Shopify order comes in with the cs_quote note
--   attribute set to a quote's id, mark that quote ordered, link the order to
--   the quote's project and move the project to ordered. A second order for a
--   quote, or an order already linked elsewhere, is logged for staff instead.
--
-- media_assets: photos and videos for a project, a warranty registration or a
--   claim (before, progress, after, claim, other), uploaded to S3 by a
--   contractor or staff; videos are processed into a poster and playback URL.
--
-- Service role only (see 029): RLS on, no policies; functions callable by the
-- service role only.
--
-- Restored 2026-11-23 from the live database after the original file was lost
-- before it was committed. It matches what is live, so re-running it changes
-- nothing. Safe to re-run.
-- ============================================================================

BEGIN;

CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1001;

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL UNIQUE DEFAULT ('Q-' || nextval('quote_number_seq')),
  token TEXT NOT NULL UNIQUE,
  audience TEXT NOT NULL CHECK (audience IN ('public', 'contractor')),
  source TEXT NOT NULL CHECK (source IN ('builder', 'portal', 'admin')),
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  project_id UUID REFERENCES contractor_projects(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  rep_id UUID REFERENCES sales_reps(id) ON DELETE SET NULL,
  created_by_pro_user UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  created_by_staff TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  buyer_role TEXT,
  timeline TEXT,
  zip TEXT,
  ship_to JSONB,
  inputs JSONB NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  lines JSONB NOT NULL DEFAULT '[]',
  cost_total NUMERIC(14,2),
  subtotal_full NUMERIC(14,2) NOT NULL,
  discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(14,2) NOT NULL DEFAULT 0,
  tier_id UUID REFERENCES pricing_tiers(id) ON DELETE SET NULL,
  tier_name TEXT,
  shipping TEXT NOT NULL CHECK (shipping IN ('free', 'freight')),
  shipping_total NUMERIC(14,2),
  total NUMERIC(14,2) NOT NULL,
  priced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  price_override JSONB,
  proposal JSONB,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'checkout', 'ordered', 'lost', 'cancelled')),
  checkout_at TIMESTAMPTZ,
  handoff TEXT CHECK (handoff IS NULL OR handoff IN ('freight', 'terms', 'no_access', 'incomplete')),
  shopify_draft_order_id TEXT,
  invoice_url TEXT,
  draft_revision INTEGER,
  shopify_order_id TEXT,
  ordered_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  reoffered_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  missing JSONB NOT NULL DEFAULT '[]',
  CONSTRAINT quotes_amounts_check CHECK (
    subtotal_full >= 0 AND total >= 0 AND revision >= 1
    AND (shipping_total IS NULL OR shipping_total >= 0)
    AND (cost_total IS NULL OR cost_total >= 0)
  ),
  CONSTRAINT quotes_lines_array_check CHECK (jsonb_typeof(lines) = 'array' AND jsonb_typeof(missing) = 'array')
);
CREATE INDEX IF NOT EXISTS idx_quotes_contractor ON quotes (contractor_id, created_at DESC) WHERE contractor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes (lower(email));
CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes (project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_rep ON quotes (rep_id, created_at DESC) WHERE rep_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_shopify_order ON quotes (shopify_order_id) WHERE shopify_order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_status_expiry ON quotes (status, expires_at);

CREATE TABLE IF NOT EXISTS quote_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind TEXT NOT NULL,
  actor TEXT,
  summary TEXT NOT NULL,
  data JSONB
);
CREATE INDEX IF NOT EXISTS idx_quote_events_quote ON quote_events (quote_id, at DESC);

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID REFERENCES contractors(id) ON DELETE CASCADE,
  project_id UUID REFERENCES contractor_projects(id) ON DELETE SET NULL,
  warranty_registration_id UUID REFERENCES warranty_registrations(id) ON DELETE SET NULL,
  warranty_claim_id UUID REFERENCES warranty_claims(id) ON DELETE SET NULL,
  stage TEXT NOT NULL CHECK (stage IN ('before', 'progress', 'after', 'claim', 'other')),
  kind TEXT NOT NULL CHECK (kind IN ('photo', 'video')),
  s3_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  mime TEXT,
  bytes BIGINT,
  file_name TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'ready', 'processing', 'failed')),
  job_id TEXT,
  poster_url TEXT,
  playback_url TEXT,
  uploaded_by UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  uploaded_by_staff TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_media_assets_contractor ON media_assets (contractor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_processing ON media_assets (status) WHERE status IN ('uploading', 'processing');
CREATE INDEX IF NOT EXISTS idx_media_assets_project ON media_assets (project_id, created_at) WHERE project_id IS NOT NULL;

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- A Shopify order carrying cs_quote = <quote id> marks that quote ordered.
CREATE OR REPLACE FUNCTION link_quote_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
DECLARE
  quote_ref TEXT;
  q_id UUID;
  q_project UUID;
  q_order TEXT;
  other_quote TEXT;
BEGIN
  IF NEW.deleted_at IS NOT NULL OR jsonb_typeof(NEW.custom_attributes) IS DISTINCT FROM 'array' THEN
    RETURN NEW;
  END IF;

  BEGIN
    SELECT a->>'value' INTO quote_ref
      FROM jsonb_array_elements(NEW.custom_attributes) a
      WHERE jsonb_typeof(a) = 'object' AND a->>'key' = 'cs_quote'
      LIMIT 1;
    IF quote_ref IS NULL OR quote_ref !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      RETURN NEW;
    END IF;

    SELECT id, project_id, shopify_order_id INTO q_id, q_project, q_order FROM quotes WHERE id = quote_ref::UUID;
    IF q_id IS NULL OR q_order = NEW.shopify_id THEN
      RETURN NEW;
    END IF;

    -- This order already belongs to another quote (linked by hand), or this quote already has
    -- a different order: tell staff rather than move anything.
    SELECT number INTO other_quote FROM quotes WHERE shopify_order_id = NEW.shopify_id AND id <> q_id LIMIT 1;
    IF q_order IS NOT NULL OR other_quote IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1 FROM quote_events
         WHERE quote_id = q_id AND kind = 'duplicate_order' AND data->>'shopify_order_id' = NEW.shopify_id
      ) THEN
        INSERT INTO quote_events (quote_id, kind, actor, summary, data)
        VALUES (q_id, 'duplicate_order', 'Shopify',
                'Another order arrived for this quote: ' || COALESCE(NEW.name, 'an order')
                  || CASE WHEN other_quote IS NOT NULL THEN ' (already linked to ' || other_quote || ')' ELSE '' END
                  || '. Check whether the buyer paid twice.',
                jsonb_build_object('shopify_order_id', NEW.shopify_id, 'name', NEW.name, 'total', NEW.total_price));
      END IF;
      RETURN NEW;
    END IF;

    UPDATE quotes
       SET status = 'ordered',
           shopify_order_id = NEW.shopify_id,
           ordered_at = COALESCE(NEW.shopify_created_at, NOW()),
           updated_at = NOW()
     WHERE id = q_id
       AND shopify_order_id IS NULL;
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;

    INSERT INTO quote_events (quote_id, kind, actor, summary, data)
    VALUES (q_id, 'ordered', 'Shopify', 'Ordered as ' || COALESCE(NEW.name, 'a Shopify order'),
            jsonb_build_object('shopify_order_id', NEW.shopify_id, 'name', NEW.name, 'total', NEW.total_price));

    IF q_project IS NOT NULL THEN
      INSERT INTO contractor_project_orders (project_id, shopify_order_id, linked_by)
      VALUES (q_project, NEW.shopify_id, 'quote')
      ON CONFLICT DO NOTHING;
      UPDATE contractor_projects
         SET stage = 'ordered', updated_at = NOW()
       WHERE id = q_project AND stage IN ('lead', 'quoted', 'won');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'link_quote_order skipped order %: %', NEW.shopify_id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION link_quote_order() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION link_quote_order() TO service_role;

DROP TRIGGER IF EXISTS shopify_orders_link_quote ON shopify_orders;
CREATE TRIGGER shopify_orders_link_quote
  AFTER INSERT OR UPDATE OF custom_attributes, deleted_at ON shopify_orders
  FOR EACH ROW EXECUTE FUNCTION link_quote_order();

COMMIT;
