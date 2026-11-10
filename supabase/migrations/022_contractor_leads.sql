-- ============================================================================
-- Quote requests from contractor pages (/contractor/<slug>) are ordinary rows
-- in leads, tagged with the contractor they were sent to.
--
-- contractor_id: the contractor whose page the request came from. Deleting a
--   contractor keeps the lead and clears this.
-- contractor_notified_at: when the request was emailed to the contractor; null
--   when they have no email or the email failed.
--
-- Add-only: two nullable columns and an index on leads. Safe to re-run.
-- ============================================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contractor_notified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_contractor ON leads(contractor_id, created_at DESC) WHERE contractor_id IS NOT NULL;
