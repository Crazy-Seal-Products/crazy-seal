-- ============================================================================
-- leads.quote_last_try_at: when resendUnsentQuotes last tried a contractor
-- quote request that hasn't reached anyone. The retry route
-- (/api/cron/contractor-quotes) runs without CRON_SECRET, so anyone can call
-- it; it tries each request at most once an hour, and a caller only sends a
-- try it claimed by moving this time forward first.
--
-- Add-only: one nullable column. Safe to re-run.
-- ============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS quote_last_try_at TIMESTAMPTZ;
