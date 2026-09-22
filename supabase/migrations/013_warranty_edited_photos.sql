-- Designer-uploaded final images. Kept separate from customer originals.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS edited_photo_urls JSONB DEFAULT '[]';
