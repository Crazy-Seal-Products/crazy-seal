-- Add missing how_heard field used by the lead intake API
ALTER TABLE leads ADD COLUMN IF NOT EXISTS how_heard TEXT;
