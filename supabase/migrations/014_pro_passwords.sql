-- Password hashes for Pro Hub. Stored on pro_users; verification happens in
-- API routes with the service role. Never expose this column to the client.

ALTER TABLE pro_users
  ADD COLUMN IF NOT EXISTS password_hash TEXT;
