-- Split warranty registration photos into labeled before / after sets.
-- photo_urls is kept as the combined list so older rows and existing readers stay valid.
ALTER TABLE warranty_registrations
  ADD COLUMN IF NOT EXISTS before_photo_urls JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS after_photo_urls JSONB DEFAULT '[]';
