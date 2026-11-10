-- Crazy Seal Admin roles and permissions. Add-only: two new tables, no
-- changes to existing tables or columns.
--
-- Roles are the existing staff.role values: 'super_admin', 'admin', 'staff'
-- (an empty role still counts as 'admin', as before). Both tables are written
-- by the server with the service role only; RLS is on with no policies, so no
-- client can read or write them.

-- Per-role overrides of the code defaults in src/lib/portal/admin/sections.ts.
-- No row means the default applies. 'super_admin' is never read from here:
-- it always has every section, so nobody can lock everyone out.
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role TEXT NOT NULL,
  section TEXT NOT NULL,
  allowed BOOLEAN NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, section)
);

ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;

-- Admin sign-ins and every change to who can do what in the admin.
CREATE TABLE IF NOT EXISTS admin_access_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_email TEXT NOT NULL,
  actor_name TEXT,
  -- The account acted on. Text, so the log still reads if the account goes.
  target_email TEXT,
  -- sign_in | role_change | access_on | access_off | staff_added | password_reset | permissions
  action TEXT NOT NULL,
  detail JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_access_log_created ON admin_access_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_target ON admin_access_log(target_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_actor ON admin_access_log(actor_email, created_at DESC);

ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;
