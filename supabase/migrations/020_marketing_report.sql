-- Marketing tab (/portal/admin/marketing): one read-only report built from the
-- site's own visit tracking (sessions, visitors), leads, and the Shopify copy.
-- Days are store days (America/New_York). Only the admin server code calls it,
-- with the service role.

-- Host of a URL without "www.", or NULL. Handles android-app:// referrers.
CREATE OR REPLACE FUNCTION marketing_url_host(url TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT NULLIF(regexp_replace(lower(substring(url FROM '^[A-Za-z][A-Za-z0-9+.-]*://([^/:?#]+)')), '^www\.', ''), '')
$$;

-- p_from / p_to: first and last day, inclusive. p_from NULL = all history.
-- p_prev_from: start of the comparison period, which ends the day before p_from.
CREATE OR REPLACE FUNCTION admin_marketing_report(p_from DATE, p_to DATE, p_prev_from DATE DEFAULT NULL)
RETURNS JSONB
LANGUAGE sql STABLE
SET search_path = public
AS $$
WITH
bounds AS (
  SELECT
    COALESCE(p_from::timestamp AT TIME ZONE 'America/New_York', '-infinity'::timestamptz) AS lo,
    ((p_to + 1)::timestamp AT TIME ZONE 'America/New_York') AS hi,
    (p_prev_from::timestamp AT TIME ZONE 'America/New_York') AS prev_lo
),
lead_counts AS (
  SELECT session_id, COUNT(*)::int AS n
  FROM leads
  WHERE session_id IS NOT NULL AND status <> 'spam'
  GROUP BY session_id
),
-- One row per visit (tracked session) in the range.
visits AS (
  SELECT
    s.started_at,
    NULLIF(lower(trim(s.utm_source)), '') AS src,
    NULLIF(lower(trim(s.utm_medium)), '') AS med,
    NULLIF(trim(s.utm_campaign), '') AS campaign,
    marketing_url_host(s.referrer) AS host,
    (NULLIF(s.gclid, '') IS NOT NULL OR NULLIF(s.gbraid, '') IS NOT NULL OR NULLIF(s.wbraid, '') IS NOT NULL) AS g,
    (NULLIF(s.fbclid, '') IS NOT NULL) AS f,
    (NULLIF(s.msclkid, '') IS NOT NULL) AS m,
    (NULLIF(s.ttclid, '') IS NOT NULL) AS t,
    COALESCE(NULLIF(split_part(split_part(regexp_replace(s.landing_page, '^[A-Za-z]+://[^/]+', ''), '?', 1), '#', 1), ''), '/') AS landing,
    COALESCE(NULLIF(s.device_type, ''), 'unknown') AS device,
    COALESCE(lc.n, 0) AS leads
  FROM sessions s
  CROSS JOIN bounds b
  LEFT JOIN lead_counts lc ON lc.session_id = s.id
  WHERE s.started_at >= b.lo AND s.started_at < b.hi
),
-- Leads in the range, with the source that first brought the person to the site.
lead_rows AS (
  SELECT
    l.id,
    lower(trim(l.email)) AS email,
    l.created_at,
    COALESCE(NULLIF(l.lead_type, ''), 'quote') AS lead_type,
    NULLIF(lower(trim(l.first_utm_source)), '') AS src,
    NULLIF(lower(trim(l.first_utm_medium)), '') AS med,
    marketing_url_host(l.first_referrer) AS host,
    (NULLIF(l.first_gclid, '') IS NOT NULL) AS g,
    (NULLIF(l.first_fbclid, '') IS NOT NULL) AS f,
    (l.session_id IS NOT NULL) AS tracked
  FROM leads l
  CROSS JOIN bounds b
  WHERE l.created_at >= b.lo AND l.created_at < b.hi AND l.status <> 'spam'
),
-- One row per person (earliest lead in the range), so repeat form fills don't double revenue.
people AS (
  SELECT DISTINCT ON (email) *
  FROM lead_rows
  WHERE email <> ''
  ORDER BY email, created_at
),
-- Orders each person placed on or after their lead, any channel (draft orders included).
people_sales AS (
  SELECT p.email, COUNT(o.id)::int AS orders, SUM(COALESCE(o.current_total_price, o.total_price, 0)) AS revenue
  FROM people p
  JOIN shopify_orders o
    ON p.email IN (lower(o.email), lower(o.customer_email))
   AND o.shopify_created_at >= p.created_at
   AND NOT o.test
   AND o.deleted_at IS NULL
   AND o.cancelled_at IS NULL
  GROUP BY p.email
),
orders_in_range AS (
  SELECT
    o.source_name,
    COALESCE(o.current_total_price, o.total_price, 0) AS revenue,
    COALESCE(o.total_discounts, 0) AS discounts,
    COALESCE(o.discount_codes, '{}') AS discount_codes,
    -- Set at checkout by /api/store/checkout from the site's visitor cookie.
    (
      SELECT a->>'value'
      FROM jsonb_array_elements(CASE WHEN jsonb_typeof(o.custom_attributes) = 'array' THEN o.custom_attributes ELSE '[]'::jsonb END) a
      WHERE a->>'key' = '_cs_visitor'
      LIMIT 1
    ) AS visitor_key
  FROM shopify_orders o
  CROSS JOIN bounds b
  WHERE o.shopify_created_at >= b.lo AND o.shopify_created_at < b.hi
    AND NOT o.test AND o.deleted_at IS NULL AND o.cancelled_at IS NULL
),
-- Tagged orders by the visitor's first-touch source.
order_sources AS (
  SELECT
    NULLIF(lower(trim(v.first_utm_source)), '') AS src,
    NULLIF(lower(trim(v.first_utm_medium)), '') AS med,
    marketing_url_host(v.first_referrer) AS host,
    (NULLIF(v.first_gclid, '') IS NOT NULL) AS g,
    (NULLIF(v.first_fbclid, '') IS NOT NULL) AS f,
    (NULLIF(v.first_msclkid, '') IS NOT NULL) AS m,
    (NULLIF(v.first_ttclid, '') IS NOT NULL) AS t,
    COUNT(*)::int AS orders,
    SUM(o.revenue)::numeric(14, 2) AS revenue
  FROM orders_in_range o
  CROSS JOIN LATERAL (
    SELECT * FROM visitors v WHERE v.fingerprint = o.visitor_key ORDER BY v.first_seen_at LIMIT 1
  ) v
  WHERE o.visitor_key IS NOT NULL
  GROUP BY 1, 2, 3, 4, 5, 6, 7
),
customers AS (
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE c.email_marketing_state = 'SUBSCRIBED')::int AS email_subscribed,
    COUNT(*) FILTER (WHERE c.sms_marketing_state = 'SUBSCRIBED')::int AS sms_subscribed,
    COUNT(*) FILTER (WHERE c.shopify_created_at >= b.lo AND c.shopify_created_at < b.hi)::int AS new_customers,
    COUNT(*) FILTER (
      WHERE c.email_marketing_state = 'SUBSCRIBED'
        AND NULLIF(c.payload->'defaultEmailAddress'->>'marketingUpdatedAt', '')::timestamptz >= b.lo
        AND NULLIF(c.payload->'defaultEmailAddress'->>'marketingUpdatedAt', '')::timestamptz < b.hi
    )::int AS new_email_subscribers
  FROM shopify_customers c
  CROSS JOIN bounds b
  WHERE c.deleted_at IS NULL
),
warranty AS (
  SELECT
    COUNT(*)::int AS registrations,
    COUNT(w.rating)::int AS rated,
    ROUND(AVG(w.rating)::numeric, 2) AS avg_rating,
    jsonb_build_array(
      COUNT(*) FILTER (WHERE w.rating = 1), COUNT(*) FILTER (WHERE w.rating = 2), COUNT(*) FILTER (WHERE w.rating = 3),
      COUNT(*) FILTER (WHERE w.rating = 4), COUNT(*) FILTER (WHERE w.rating = 5)
    ) AS ratings,
    COUNT(*) FILTER (WHERE w.photo_display_consent)::int AS photo_consent,
    COUNT(*) FILTER (WHERE w.reviews_for_marketing = 'Use For Marketing/Website')::int AS marketing_ready
  FROM warranty_registrations w
  CROSS JOIN bounds b
  WHERE w.created_at >= b.lo AND w.created_at < b.hi
),
prev AS (
  SELECT
    (SELECT COUNT(*) FROM sessions s WHERE s.started_at >= b.prev_lo AND s.started_at < b.lo)::int AS visits,
    (SELECT COUNT(*) FROM leads l WHERE l.created_at >= b.prev_lo AND l.created_at < b.lo AND l.status <> 'spam')::int AS leads
  FROM bounds b
  WHERE b.prev_lo IS NOT NULL
)
SELECT jsonb_build_object(
  'tracking_since', (SELECT MIN(started_at) FROM sessions),
  'sources', COALESCE((
    SELECT jsonb_agg(x) FROM (
      SELECT src, med, host, g, f, m, t, COUNT(*)::int AS visits, SUM(leads)::int AS leads
      FROM visits GROUP BY 1, 2, 3, 4, 5, 6, 7
    ) x), '[]'::jsonb),
  'daily', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.day) FROM (
      SELECT (started_at AT TIME ZONE 'America/New_York')::date AS day, COUNT(*)::int AS visits
      FROM visits GROUP BY 1
    ) x), '[]'::jsonb),
  'daily_leads', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.day) FROM (
      SELECT (created_at AT TIME ZONE 'America/New_York')::date AS day, COUNT(*)::int AS leads
      FROM lead_rows GROUP BY 1
    ) x), '[]'::jsonb),
  -- One row per campaign; its usual source/medium and any click ids pick the channel
  -- (some ad links arrive tagged "paid" with no source).
  'campaigns', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.visits DESC) FROM (
      SELECT
        campaign,
        mode() WITHIN GROUP (ORDER BY src) AS src,
        mode() WITHIN GROUP (ORDER BY med) AS med,
        mode() WITHIN GROUP (ORDER BY host) AS host,
        bool_or(g) AS g, bool_or(f) AS f, bool_or(m) AS m, bool_or(t) AS t,
        COUNT(*)::int AS visits, SUM(leads)::int AS leads
      FROM visits WHERE campaign IS NOT NULL
      GROUP BY campaign ORDER BY visits DESC LIMIT 25
    ) x), '[]'::jsonb),
  'landing', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.visits DESC) FROM (
      SELECT landing AS path, COUNT(*)::int AS visits, SUM(leads)::int AS leads
      FROM visits GROUP BY 1 ORDER BY 2 DESC LIMIT 20
    ) x), '[]'::jsonb),
  'devices', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.visits DESC) FROM (
      SELECT device, COUNT(*)::int AS visits, SUM(leads)::int AS leads FROM visits GROUP BY 1
    ) x), '[]'::jsonb),
  'lead_types', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.leads DESC) FROM (
      SELECT lead_type, COUNT(*)::int AS leads FROM lead_rows GROUP BY 1
    ) x), '[]'::jsonb),
  'lead_sales', COALESCE((
    SELECT jsonb_agg(x) FROM (
      SELECT p.src, p.med, p.host, p.g, p.f,
        COUNT(*)::int AS people,
        COUNT(ps.email)::int AS buyers,
        COALESCE(SUM(ps.orders), 0)::int AS orders,
        COALESCE(SUM(ps.revenue), 0)::numeric(14, 2) AS revenue
      FROM people p LEFT JOIN people_sales ps ON ps.email = p.email
      GROUP BY 1, 2, 3, 4, 5
    ) x), '[]'::jsonb),
  'leads_tracked', (SELECT COUNT(*) FILTER (WHERE tracked)::int FROM lead_rows),
  'orders', (
    SELECT jsonb_build_object(
      'total', COUNT(*)::int,
      'revenue', COALESCE(SUM(revenue), 0)::numeric(14, 2),
      'online', COUNT(*) FILTER (WHERE source_name = 'web')::int,
      'online_revenue', COALESCE(SUM(revenue) FILTER (WHERE source_name = 'web'), 0)::numeric(14, 2),
      'tagged', COUNT(*) FILTER (WHERE visitor_key IS NOT NULL)::int
    ) FROM orders_in_range),
  'order_sources', COALESCE((SELECT jsonb_agg(x) FROM order_sources x), '[]'::jsonb),
  'codes', COALESCE((
    SELECT jsonb_agg(x ORDER BY x.orders DESC, x.sales DESC) FROM (
      SELECT upper(code) AS code, COUNT(*)::int AS orders, SUM(o.revenue)::numeric(14, 2) AS sales, SUM(o.discounts)::numeric(14, 2) AS discount
      FROM orders_in_range o CROSS JOIN LATERAL unnest(o.discount_codes) AS code
      GROUP BY 1 ORDER BY 2 DESC, 3 DESC LIMIT 12
    ) x), '[]'::jsonb),
  'customers', (SELECT to_jsonb(c) FROM customers c),
  'warranty', (SELECT to_jsonb(w) FROM warranty w),
  'marketing_ready_all', (SELECT COUNT(*)::int FROM warranty_registrations WHERE reviews_for_marketing = 'Use For Marketing/Website'),
  'prev', (SELECT to_jsonb(p) FROM prev p)
)
$$;

REVOKE ALL ON FUNCTION marketing_url_host(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION marketing_url_host(TEXT) TO service_role;
REVOKE ALL ON FUNCTION admin_marketing_report(DATE, DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION admin_marketing_report(DATE, DATE, DATE) TO service_role;

NOTIFY pgrst, 'reload schema';
