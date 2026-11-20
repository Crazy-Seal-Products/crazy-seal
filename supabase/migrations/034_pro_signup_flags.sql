-- Pro Hub sign-up flags: self-service sign-ups that look like a bot or otherwise need a person to look.
-- From Oct 27 to Nov 20, 2026 a bot made 220 Pro Hub accounts with harvested emails. Sign-up now
-- needs Turnstile; any sign-up that still gets through and looks odd is flagged here for staff
-- (Admin → Dealers → Portal accounts). A flag changes nothing for the account: it is a review queue.
-- Additive only, so it can be applied before the code that uses it is deployed.

alter table pro_users
  add column if not exists signup_ip text,
  add column if not exists signup_user_agent text,
  add column if not exists flag_reasons text[],
  add column if not exists flagged_at timestamptz,
  add column if not exists flag_reviewed_at timestamptz,
  add column if not exists flag_reviewed_by text;

comment on column pro_users.signup_ip is 'IP of the self-service sign-up (or sign-in link request) that created the account.';
comment on column pro_users.flag_reasons is 'Why the sign-up was flagged for review; codes are labelled in src/lib/pro/signup-flags.ts.';
comment on column pro_users.flag_reviewed_at is 'When staff looked at the flag and kept the account.';

-- The review queue: flagged and not yet looked at.
create index if not exists pro_users_flag_queue_idx on pro_users (flagged_at desc)
  where flagged_at is not null and flag_reviewed_at is null;

-- Recent sign-ups from one IP, for the same-IP flag.
create index if not exists pro_users_signup_ip_idx on pro_users (signup_ip, created_at)
  where signup_ip is not null;
