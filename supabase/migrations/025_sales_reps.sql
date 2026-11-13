-- Sales reps for the Crazy Seal Admin's Sales reps page. Add-only: one new
-- table, no changes to existing tables.
--
-- A rep's sales are the Shopify orders tagged with their name: reps build
-- dealer orders as draft orders and tag them "Dealer" plus their own name.
-- `name` is that tag (matched without regard to case). `staff_email` links
-- the rep to their admin login, so the page opens on their own numbers and,
-- for the Sales rep role, shows only theirs. `monthly_goal` is optional.
--
-- Written by the server with the service role only; RLS is on with no
-- policies, so no client can read or write it.

CREATE TABLE IF NOT EXISTS sales_reps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  staff_email TEXT,
  monthly_goal NUMERIC(14,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS sales_reps_name_key ON sales_reps (lower(name));
CREATE UNIQUE INDEX IF NOT EXISTS sales_reps_staff_email_key ON sales_reps (lower(staff_email)) WHERE staff_email IS NOT NULL;

ALTER TABLE sales_reps ENABLE ROW LEVEL SECURITY;

-- The rep tags already on orders (the list the admin used before this table).
INSERT INTO sales_reps (name) VALUES ('Amber'), ('Mike'), ('Tina'), ('Stephen'), ('Vernon')
ON CONFLICT DO NOTHING;
