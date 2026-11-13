-- ============================================================================
-- Remove direct REST access to admin, customer and tracking tables.
-- Same fix as RV Armor's 018_remove_public_table_access.sql.
--
-- 001-015 gave these RLS policies:
--   TO authenticated, USING (true): read leads, warranty registrations /
--     transfers / claims, content requests, legacy GF entries and the Shopify
--     customer and order tables; update leads and warranties; full control of
--     FAQ items, gallery images, projects and managed redirects.
--   TO public (anon): read and update every visitor and session row; insert
--     leads, warranty forms, content requests, page views and journey events.
--
-- 004 assumed "only staff members are issued Supabase auth accounts", but
-- public sign-up is on for this project, so anyone who signs up with their own
-- email and confirms it could read every customer record and rewrite the
-- site's FAQ, gallery, projects and redirects through the Supabase REST API.
-- It also meant Staff and Sales rep logins could read everything, whatever
-- their admin sections allow.
--
-- The app never needs these policies: every page, action and route reads and
-- writes with the service role (src/lib/supabase/admin.ts), which skips RLS,
-- and the session client is used only to sign in. So nothing in the app
-- changes. Policies that only let the public read published content (active
-- FAQ items and gallery images, published projects, enabled redirects) and the
-- staff row's own-row read are kept.
--
-- Safe to re-run (DROP POLICY IF EXISTS).
-- ============================================================================

BEGIN;

-- Signed-in (any account) access
DROP POLICY IF EXISTS "Authenticated can read leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can update leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated can read warranty registrations" ON public.warranty_registrations;
DROP POLICY IF EXISTS "Authenticated can update warranty registrations" ON public.warranty_registrations;
DROP POLICY IF EXISTS "Authenticated can read warranty transfers" ON public.warranty_transfers;
DROP POLICY IF EXISTS "Authenticated can update warranty transfers" ON public.warranty_transfers;
DROP POLICY IF EXISTS "Authenticated can read warranty claims" ON public.warranty_claims;
DROP POLICY IF EXISTS "Authenticated can update warranty claims" ON public.warranty_claims;
DROP POLICY IF EXISTS "Authenticated can read content requests" ON public.content_requests;
DROP POLICY IF EXISTS "Authenticated can read all FAQ items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated can manage FAQ items" ON public.faq_items;
DROP POLICY IF EXISTS "Authenticated can read all gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated can manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Authenticated can read legacy GF entries" ON public.legacy_gf_entries;
DROP POLICY IF EXISTS "Authenticated can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated can manage redirects" ON public.managed_redirects;
DROP POLICY IF EXISTS "Authenticated can read shopify customers" ON public.shopify_customers;
DROP POLICY IF EXISTS "Authenticated can read shopify orders" ON public.shopify_orders;
DROP POLICY IF EXISTS "Authenticated can read shopify order line items" ON public.shopify_order_line_items;
DROP POLICY IF EXISTS "Authenticated can read shopify sync state" ON public.shopify_sync_state;

-- Public-key (anon) access to tracking and form tables
DROP POLICY IF EXISTS "Anon can insert visitors" ON public.visitors;
DROP POLICY IF EXISTS "Anon can update own visitor" ON public.visitors;
DROP POLICY IF EXISTS "Anon can select visitors by fingerprint" ON public.visitors;
DROP POLICY IF EXISTS "Anon can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Anon can update own session" ON public.sessions;
DROP POLICY IF EXISTS "Anon can select sessions by id" ON public.sessions;
DROP POLICY IF EXISTS "Anon can insert page views" ON public.page_views;
DROP POLICY IF EXISTS "Anon can insert journey events" ON public.journey_events;
DROP POLICY IF EXISTS "Anon can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anon can insert warranty registrations" ON public.warranty_registrations;
DROP POLICY IF EXISTS "Anon can insert warranty transfers" ON public.warranty_transfers;
DROP POLICY IF EXISTS "Anon can insert warranty claims" ON public.warranty_claims;
DROP POLICY IF EXISTS "Anon can insert content requests" ON public.content_requests;

COMMIT;
