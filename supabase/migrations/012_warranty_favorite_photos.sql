-- Owner-selected favorite photos for warranty review.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS favorite_photo_urls JSONB DEFAULT '[]';
