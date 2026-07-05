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
