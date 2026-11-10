-- ============================================================================
-- Fixes found by the contractor-records and quote-requests models
-- (docs/statecharts/contractor-records, docs/statecharts/quote-requests).
--
-- contractors.edited_fields: the dealer-list fields an admin has changed. The
--   import (scripts/import-contractors.mjs) leaves those alone.
-- contractor_redirects: page addresses a contractor used to have. Their old
--   address keeps leading to their page and is never given to anyone else.
-- leads.quote_team_notified_at: when Crazy Seal's lead inbox got the copy of a
--   contractor quote request. A request with neither this nor
--   contractor_notified_at is sent again by /api/cron/contractor-quotes.
--
-- Add-only: one column on contractors, one on leads, one new table. RLS on the
-- new table with no policies, so only server code using the service-role key
-- can read or write it. Safe to re-run.
-- ============================================================================

ALTER TABLE contractors ADD COLUMN IF NOT EXISTS edited_fields TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS contractor_redirects (
  slug TEXT PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractor_redirects_contractor ON contractor_redirects(contractor_id);

ALTER TABLE contractor_redirects ENABLE ROW LEVEL SECURITY;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_team_notified_at TIMESTAMPTZ;
