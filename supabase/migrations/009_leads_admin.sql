-- Staff pipeline for live lead forms (contact, kit builder, dealer, etc.)
-- Mirrors warranty admin: status + authenticated update.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam'));

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE POLICY "Authenticated can update leads" ON leads
  FOR UPDATE TO authenticated USING (TRUE);
