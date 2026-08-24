-- Zoho Contacts Lucid_Link (website URL to the photo folder).
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS lucid_link TEXT;
