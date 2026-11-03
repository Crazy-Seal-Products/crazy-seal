-- Crazy Seal Admin "View as": a log of every time an admin opened the Pro Hub
-- as a dealer (read-only admin view). Written by the server with the service
-- role only; RLS is on with no policies, so no client can read or write it.

CREATE TABLE IF NOT EXISTS admin_view_as_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL,
  admin_name TEXT,
  pro_user_id UUID REFERENCES pro_users(id) ON DELETE SET NULL,
  -- Kept as text so the log still reads right if the Pro Hub account is deleted.
  pro_user_email TEXT NOT NULL,
  -- 'start' when the view opens, 'exit' when the admin leaves it.
  action TEXT NOT NULL DEFAULT 'start',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_view_as_log_created ON admin_view_as_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_view_as_log_pro_user ON admin_view_as_log(pro_user_id);

ALTER TABLE admin_view_as_log ENABLE ROW LEVEL SECURITY;
