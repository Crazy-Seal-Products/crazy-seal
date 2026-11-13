-- Set-your-own-password links for staff logins. Add-only: one new table.
--
-- scripts/send-password-setup.mjs emails a staff member a link to
-- /portal/set-password/?t=<token>. Only a SHA-256 of the token is stored. A
-- link works once (used_at), for 7 days (expires_at), and only while the
-- login still has an active staff row. Opening the page doesn't use it up
-- (email scanners open links); saving a password does.
--
-- Written by the server with the service role only; RLS is on with no
-- policies, so no client can read or write it.

CREATE TABLE IF NOT EXISTS staff_password_setups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_password_setups_user ON staff_password_setups(auth_user_id, created_at DESC);

ALTER TABLE staff_password_setups ENABLE ROW LEVEL SECURITY;
