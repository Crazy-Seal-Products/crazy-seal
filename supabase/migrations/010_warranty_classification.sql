-- Owner classification fields, mirrored from Zoho Contacts:
-- Image_Type and Reviews_for_Marketing.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS image_type TEXT,
  ADD COLUMN IF NOT EXISTS reviews_for_marketing TEXT;

CREATE INDEX IF NOT EXISTS idx_warranty_reg_reviews_for_marketing
  ON warranty_registrations (reviews_for_marketing);

CREATE INDEX IF NOT EXISTS idx_warranty_reg_image_type
  ON warranty_registrations (image_type);
