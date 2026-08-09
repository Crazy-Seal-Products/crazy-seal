# Crazy Seal

Marketing site for [crazyseal.com](https://crazyseal.com) — the patented, fluid-applied, seamless DIY roofing system.

Rebuilt from WordPress on the RV Armor architecture: Next.js App Router, Tailwind v4, Supabase, AWS S3 + CloudFront (`media.crazyseal.com`), deployed on Vercel. The online store remains on Shopify at [buy.crazyseal.com](https://buy.crazyseal.com).

## Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4, custom design tokens (`src/lib/design-system/`)
- **Database:** Supabase (leads, tracking, warranty system, FAQ, gallery)
- **Media:** S3 `crazy-seal-media` bucket behind CloudFront at `media.crazyseal.com`
  - `site-assets/wp-media/{year}/` — migrated WordPress media library
  - `gravity-forms/{form-hash}/` — legacy Gravity Forms uploads (warranty photos), original paths preserved
  - `user-uploads/` — new form photo uploads
- **Forms pipeline:** Turnstile → Supabase → Zoho CRM + Gmail notifications + Meta CAPI

## Develop

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in credentials.

## Database

Migrations live in `supabase/migrations/` and are applied with psql against the pooler connection (`DATABASE_URL` in `.env.local`):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/XXX_name.sql
```

## Legacy data delta sync (pre-launch runbook)

The WordPress site keeps collecting form entries until cutover, so run this
sequence right before launch (all safe to re-run; they only add what's missing):

```bash
source .env.local

# 1. Copy new Gravity Forms uploads from the WP server to S3.
#    SFTP credentials are in the EasyWP dashboard (SFTP Access).
#    TIP: run this step from AWS CloudShell (console.aws.amazon.com, us-east-1)
#    so the transfer is cloud-to-cloud instead of through your home internet —
#    see the header of scripts/sync-gf-media.mjs for the one-time setup.
export WP_SFTP_USER=... WP_SFTP_PASS=...
node scripts/sync-gf-media.mjs --dry-run          # preview
node scripts/sync-gf-media.mjs                    # upload
# Faster on repeat runs: --since 2026-08-01
# Other folders, e.g. new WP media library files:
#   node scripts/sync-gf-media.mjs --remote-dir 2026 --s3-prefix site-assets/wp-media/2026

# 2. Export entries from WP admin (Forms -> Import/Export -> Export Entries,
#    include "Entry ID" and "Entry Date"), then import the CSV. Upserts by
#    (form_id, entry_id), so re-importing a full export is fine.
node scripts/import-legacy-gf.mjs --file ~/Downloads/warranty.csv --form-id 4 --title "Warranty Registration"

# 3. Map warranty entries (form 4) from the raw archive into
#    warranty_registrations so they show in /admin/warranty and get
#    certificate pages. Dry-run prints the resolved field mapping first.
node scripts/map-legacy-warranty.mjs              # dry run
node scripts/map-legacy-warranty.mjs --apply
```

Raw entries for every form are browsable at `/admin/entries`; mapped warranty
registrations at `/admin/warranty`.

## WordPress parity + launch checklist

Every public URL on the legacy WordPress site is inventoried in
`src/lib/generated/wp-url-inventory.json` (rebuild with
`node scripts/build-wp-inventory.mjs` while the WP site is still up). The
admin sitemap at `/admin/sitemap` merges this inventory with the live route
manifest (regenerated automatically on every `dev`/`build` by
`scripts/generate-route-manifest.mjs`), Supabase projects, and store products,
and shows each legacy URL's disposition: live, redirected, or missing.

Redirects come from two places:

- `src/lib/redirects.ts` — code-defined, compiled into `next.config` (deploy to change)
- `managed_redirects` table — editable at `/admin/redirects`, applied by
  `src/proxy.ts` at request time (live within ~1 minute, no deploy)

Verify full parity before and after cutover:

```bash
node scripts/audit-wp-parity.mjs                        # against localhost:3004 (dev)
node scripts/audit-wp-parity.mjs https://crazyseal.com  # against production after DNS cutover
```

Go-live sequence:

1. Set all `.env.local` variables in Vercel and deploy.
2. Run the pre-launch runbook above (GF media SFTP sync, GF CSV import, warranty mapping).
3. Run `node scripts/audit-wp-parity.mjs <vercel-preview-url>` and check `/admin/sitemap` shows zero missing.
4. Point crazyseal.com DNS at Vercel. Keep the EasyWP box alive until a final
   `sync-gf-media.mjs` pass has copied any last-minute uploads.
5. Re-run the parity audit against `https://crazyseal.com` and resubmit the
   sitemap in Google Search Console.
