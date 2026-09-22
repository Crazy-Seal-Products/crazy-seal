-- Zoho Contacts picklist "Reviews for Marketing" (Reviews_for_Marketing).
-- Used to tag warranty photo sets for marketing use.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS reviews_for_marketing TEXT;

CREATE INDEX IF NOT EXISTS idx_warranty_reg_marketing_review
  ON warranty_registrations (reviews_for_marketing);
