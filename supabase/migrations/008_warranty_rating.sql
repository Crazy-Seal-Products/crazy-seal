-- =============================================
-- WARRANTY REGISTRATION EXPERIENCE RATING
-- 1-5 star rating collected on the registration form
-- =============================================
ALTER TABLE warranty_registrations
  ADD COLUMN rating SMALLINT CHECK (rating BETWEEN 1 AND 5);
