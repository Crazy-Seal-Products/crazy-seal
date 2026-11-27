-- ============================================================================
-- import_contractor_leads(contractor) can no longer fail on a roof size.
--
-- The function (032_contractor_projects.sql) copies a contractor's website
-- quote requests into their customers and projects each time their portal
-- loads. It read the roof size by casting the first run of digits in
-- leads.square_footage to INTEGER, so a quote request with a size like
-- 99999999999 overflowed the cast, the whole import failed, and it failed
-- again on every portal load (none of the contractor's requests came in).
--
-- This replaces the function with the same body except that the size is only
-- cast when the digits are 1 to 9 long (always within INTEGER); anything
-- longer leaves the project's sqft empty, and the size the buyer typed is
-- still in the project's name. 032 stays as it is: it matches what was live
-- when it was restored.
--
-- Applied to the live database 2026-11-23.
--
-- Service role only (see 029): the function is callable by the service role
-- only. Safe to re-run.
-- ============================================================================

BEGIN;

-- Website quote requests -> the contractor's customers and projects.
CREATE OR REPLACE FUNCTION import_contractor_leads(p_contractor UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $function$
DECLARE
  n INT := 0;
  r RECORD;
  owner UUID;
  cust UUID;
  size_text TEXT;
  size_digits TEXT;
  sqft_num INT;
  note TEXT;
BEGIN
  SELECT pro_user_id INTO owner FROM contractor_members
    WHERE contractor_id = p_contractor AND role = 'owner' AND status = 'active'
    ORDER BY created_at LIMIT 1;

  FOR r IN
    SELECT l.id, l.name, l.email, l.phone, l.location, l.rv_length, l.square_footage, l.message, l.project_type, l.created_at
    FROM leads l
    WHERE l.contractor_id = p_contractor
      AND NOT EXISTS (SELECT 1 FROM contractor_lead_imports i WHERE i.lead_id = l.id)
    ORDER BY l.created_at
    LIMIT 500
  LOOP
    INSERT INTO contractor_lead_imports (lead_id, contractor_id) VALUES (r.id, p_contractor)
      ON CONFLICT (lead_id) DO NOTHING;
    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    size_text := COALESCE(NULLIF(r.square_footage, ''), NULLIF(r.rv_length, ''));
    -- Only a size that fits in INTEGER (1 to 9 digits) is kept; a longer one would overflow the cast.
    size_digits := SUBSTRING(REPLACE(COALESCE(r.square_footage, ''), ',', '') FROM '(\d+)');
    sqft_num := CASE WHEN size_digits ~ '^\d{1,9}$' THEN size_digits::INT END;
    note := NULLIF(TRIM(REGEXP_REPLACE(COALESCE(r.message, ''), '^Quote request for .*?\(contractor page\)\.\s*', '')), '');

    INSERT INTO contractor_customers (contractor_id, name, type, contact_name, email, phone, zip, notes, assigned_to, lead_id, created_at)
    VALUES (
      p_contractor,
      r.name,
      CASE WHEN r.project_type = 'Commercial' THEN 'Building owner' ELSE 'RV owner' END,
      r.name,
      r.email,
      r.phone,
      CASE WHEN r.location ~ '^\d{5}$' THEN r.location END,
      note,
      owner,
      r.id,
      r.created_at
    )
    RETURNING id INTO cust;

    INSERT INTO contractor_projects (contractor_id, customer_id, lead_id, name, stage, sqft, roof_type, source, notes, site, assigned_to, created_at, updated_at)
    VALUES (
      p_contractor,
      cust,
      r.id,
      r.name || ': ' || CASE WHEN r.project_type = 'Commercial' THEN 'roof' ELSE 'RV roof' END
        || CASE WHEN size_text IS NOT NULL THEN ' (' || size_text || ')' ELSE '' END,
      'lead',
      sqft_num,
      CASE WHEN r.project_type = 'Commercial' THEN 'Commercial roof' ELSE 'RV roof' END,
      'Crazy Seal page',
      note,
      CASE WHEN r.location ~ '^\d{5}$' THEN jsonb_build_object('zip', r.location) END,
      owner,
      r.created_at,
      r.created_at
    );

    INSERT INTO contractor_activity (at, contractor_id, actor_name, entity, entity_id, action, summary)
    VALUES (r.created_at, p_contractor, 'Crazy Seal website', 'projects', r.id::TEXT, 'request',
            'Quote request from ' || r.name || ' on your Crazy Seal page');
    n := n + 1;
  END LOOP;
  RETURN n;
END;
$function$;

REVOKE ALL ON FUNCTION import_contractor_leads(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION import_contractor_leads(UUID) TO service_role;

COMMIT;
