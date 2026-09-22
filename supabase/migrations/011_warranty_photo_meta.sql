-- Per-photo before/after classification and owner favorites.
-- Keyed by photo URL so it stays aligned with photo_urls.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS photo_meta JSONB DEFAULT '{}';
