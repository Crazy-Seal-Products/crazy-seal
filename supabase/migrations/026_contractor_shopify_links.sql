-- ============================================================================
-- Contractors linked to Shopify: the Shopify dealer roster (customers tagged
-- Dealer, Pro or Professional, or with an order tagged Dealer) consolidated
-- into contractors, the admin's Contractors page.
--
-- contractors.shopify_customer_ids: the Shopify customers who are this
--   contractor (usually one; a contractor who orders under two emails has
--   two). Their orders and lifetime spend are the contractor's spending in the
--   admin. Set by the Shopify sync (src/lib/contractors/shopify-sync.ts) and
--   by an admin linking a customer by hand.
-- contractors.unlinked_customer_ids: customers an admin said aren't this
--   contractor. The sync never links them to this contractor again.
-- contractors.source: where the row came from: 'list' (the dealer-list
--   import), 'admin' (added by hand) or 'shopify' (a Shopify dealer the sync
--   added, hidden until an admin lists them).
--
-- Add-only: three columns and an index; existing rows keep their data. Rows
-- with no import_key were added by hand. Safe to re-run.
-- ============================================================================

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS shopify_customer_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS unlinked_customer_ids TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE contractors ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'list';

DO $$
BEGIN
  ALTER TABLE contractors ADD CONSTRAINT contractors_source_check CHECK (source IN ('list', 'admin', 'shopify'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE contractors SET source = 'admin' WHERE import_key IS NULL AND source = 'list';

CREATE INDEX IF NOT EXISTS idx_contractors_customers ON contractors USING GIN (shopify_customer_ids);
