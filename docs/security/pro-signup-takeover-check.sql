-- Was the Pro Hub sign-up hole used? Read-only: every statement here is a SELECT.
-- Run in the Supabase SQL editor for the Crazy Seal project. Prepared 2026-11-06; not run by anyone yet.
--
-- The hole (main up to 96e6068): sign-up set a password and signed in at once whenever the email had
-- no password, without checking that the person controls the email. Fixed on fix/pro-access-signup.
--
-- How a password can get onto an account:
--   * sign-up (old code): no link involved
--   * /pro/reset/: needs a used link (pro_magic_links.used_at)
--   * the change-password page: needs a session, which came from sign-up, a link, or a password login
-- So an account with a password that never used a link got its password from sign-up. For accounts
-- that did use links, the database can't tell whether the password came from sign-up or a reset.
--
-- Limits: signing out deletes that session row, so session history is incomplete. Nothing records
-- IP addresses. "after_link" below means a link for the email was used up to 2 minutes before the
-- session started (a sign-in or reset); any other session came from sign-up or a password login.


-- 1. Every account with a password, the shape of how it got one, and what it could see.
with link_use as (
  select lower(email) as email,
         count(*) filter (where used_at is not null) as links_used,
         min(used_at) as first_link_used_at,
         max(used_at) as last_link_used_at
  from pro_magic_links
  group by lower(email)
),
session_rows as (
  select s.pro_user_id, s.created_at, s.expires_at,
         exists (
           select 1 from pro_magic_links l
           where lower(l.email) = lower(u.email)
             and l.used_at between s.created_at - interval '2 minutes' and s.created_at
         ) as after_link
  from pro_sessions s
  join pro_users u on u.id = s.pro_user_id
),
session_summary as (
  select pro_user_id,
         count(*) as sessions,
         count(*) filter (where expires_at > now()) as active_sessions,
         count(*) filter (where not after_link) as sessions_without_link,
         min(created_at) filter (where not after_link) as first_session_without_link,
         max(created_at) as last_session_at
  from session_rows
  group by pro_user_id
)
select
  case
    when u.email ~ '[%*",]'
      then '1 email is a pattern or filter text'
    when coalesce(l.links_used, 0) = 0
     and (u.invited_at is not null or u.created_at < s.first_session_without_link - interval '2 minutes')
      then '2 existing account claimed by sign-up, never used a link'
    when coalesce(l.links_used, 0) = 0
      then '3 created by sign-up, never used a link'
    when l.first_link_used_at < s.first_session_without_link
      then '4 used links before a password appeared: sign-up or reset, ask the pro'
    else '5 used links, password origin unknown'
  end as shape,
  u.id, u.email, u.display_name, u.business_name,
  u.created_at, u.invited_at, u.last_login_at,
  coalesce(l.links_used, 0) as links_used, l.first_link_used_at, l.last_link_used_at,
  coalesce(s.sessions, 0) as sessions, coalesce(s.active_sessions, 0) as active_sessions,
  coalesce(s.sessions_without_link, 0) as sessions_without_link,
  s.first_session_without_link, s.last_session_at,
  -- What the account could see in the Pro Hub (orders come through the matching customer).
  (select count(*) from shopify_customers c
    where lower(c.email) = lower(u.email) and c.deleted_at is null) as matching_customers,
  (select count(*) from warranty_registrations w
    where w.filed_by_pro_user_id = u.id or w.email = u.email or w.installer_email = u.email) as warranty_registrations
from pro_users u
left join link_use l on l.email = lower(u.email)
left join session_summary s on s.pro_user_id = u.id
where u.password_hash is not null
order by shape, s.last_session_at desc nulls last;


-- 2. Sessions of the accounts above, newest first, to see when each one was used.
--    A wildcard email (shape 1) saw the first customer the old lookup found, not its own.
select u.email, s.created_at, s.expires_at, s.expires_at > now() as active,
       exists (
         select 1 from pro_magic_links l
         where lower(l.email) = lower(u.email)
           and l.used_at between s.created_at - interval '2 minutes' and s.created_at
       ) as after_link
from pro_sessions s
join pro_users u on u.id = s.pro_user_id
where u.password_hash is not null
order by u.email, s.created_at desc;


-- 3. Accounts that never set a password but were made with a pattern or filter text as the email
--    (sign-in links to such addresses can't be opened, so these are attempts, not access).
select id, email, created_at, last_magic_link_at
from pro_users
where password_hash is null and email ~ '[%*",]'
order by created_at desc;


-- Cleanup, for later and only for accounts you decide to reset: NOT read-only, left commented out.
-- It removes the password and signs the account out everywhere; the real pro then uses
-- "Forgot password" or a sign-in link, which only reaches their inbox.
--
-- begin;
-- delete from pro_sessions where pro_user_id in ('<id>', '<id>');
-- update pro_users set password_hash = null where id in ('<id>', '<id>');
-- commit;
