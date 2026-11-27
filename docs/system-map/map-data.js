// Crazy Seal System Map: the hand-written map of how the site is built.
//
// Areas have no parent; pieces sit inside an area (parent). Fields:
//   id, parent       unique id; the area or piece it sits inside
//   label, short     name in the reader's words; one line for the hover text
//   what, how        what it is, and how it's built (`code` and **bold** work; blank line = new paragraph)
//   rules            hard rules that keep it working
//   files, docs      repo paths; `npm run map:check` checks they exist
//   links            ids it connects to (back-links are worked out for you)
//   status           stable | in-progress | built-not-live | admin-only | retired | needs-review
//   route            where people see it, e.g. /contractor
//   flows            pstack statecharts in docs/statecharts/ that check this piece
//   x, y, w, h       areas only: where the area sits (world units, 4200 by 2520; here set from grid
//                    steps by area(), where +x runs down-right on screen and +y down-left)
//   color, icon      areas only: colour and a Lucide icon name
//
// Never put secrets, keys, env values or customer data in here.

window.CODEBASE_MAP = {
  title: 'Crazy Seal System Map',
  updated: '2026-11-23',
  world: { w: 4200, h: 2520 },
  leftOut:
    'The sixty-odd application and marketing pages (RV roofs, sheds, barns...) are shown as one piece. Also left out: the one-off WordPress and Gravity Forms migration scripts in `scripts/`, the AI bake-off tooling, and the demo data behind the dealer portal.',
  nodes: [],
  edges: [],
  tours: [],
  add(list) {
    this.nodes.push(...list)
  },
}

const U = 4200 / 34
const area = (id, label, gx, gy, color, icon, extra) => ({ id, label, x: gx * U - 100, y: (gy + 8) * U - 100, w: 200, h: 200, color, icon, ...extra })

CODEBASE_MAP.add([
  // ---------------------------------------------------------------- areas
  area('site', 'Public site', 0, 4, '#F59E0B', 'globe', {
    short: 'crazyseal.com: product, application and help pages, rebuilt from WordPress on Next.js.',
    what: 'Where every visitor lands. Product pages, a page for each kind of roof (RVs, sheds, barns, containers...), installation help, reviews and the FAQ.\n\nEvery page asks for one of three things: send a form, find an installer, or build a kit.',
    how: 'Next.js App Router pages under `src/app/`, Tailwind v4 with the tokens in `src/lib/design-system/`. Old WordPress addresses are kept working by `src/lib/redirects.ts`.',
    files: ['src/app/page.tsx', 'src/lib/redirects.ts', 'src/lib/design-system'],
    docs: ['rules/PAGE_BUILDING_RULES.md'],
  }),
  area('tracking', 'Tracking and attribution', 6, -2, '#FB923C', 'chart-column', {
    short: 'Remembers which ad or search brought each visitor, and tells Meta and Google when one becomes a lead.',
    what: 'Every visit is recorded: the first time someone came, the visit that converted, the pages in between. Leads and orders carry that history, so marketing can see what actually sells.',
    how: 'The browser client in `src/lib/tracking/client.ts` posts visits, page views and events to `/api/tracking/*`, which write to Supabase. Server-side conversions go to Meta through `meta-capi.ts`.',
    files: ['src/lib/tracking', 'src/app/api/tracking'],
  }),
  area('assistant', 'Site assistant', 0, 22, '#A78BFA', 'sparkles', {
    short: 'The chat on the site, in the Pro Hub and for staff, with a hand-off to a person.',
    what: 'Three assistants share one engine: one answers customers on the public site, one helps dealers in the Pro Hub, one helps staff in the admin. A customer can ask for a person, and the chat lands in the support inbox.',
    how: 'Models and effort per assistant are set by env vars in `src/lib/ai/config.ts`. OpenAI models go through the Vercel AI Gateway; `claude-` models go to Anthropic. Every customer chat is screened afterwards (`screen.ts`).',
    files: ['src/lib/ai', 'src/app/api/assistant'],
  }),
  area('forms', 'Forms and leads', 6, 4, '#38BDF8', 'send', {
    short: 'Contact and quote forms: checked for bots, saved, sent to the CRM and emailed to the team.',
    what: 'Most forms on the site end up as a lead. A lead is saved first, so nothing is lost if an outside service is down, then it goes to Zoho CRM, the team gets an email, and the visitor gets an automatic reply.',
    how: '`POST /api/leads`: Turnstile check, then insert with first-touch and last-touch attribution, then Meta Conversions API and Zoho in the background.',
    files: ['src/app/api/leads/route.ts', 'src/lib/turnstile.ts', 'src/components/forms'],
  }),
  area('contractors', 'Contractor network', 6, 10, '#2DD4BF', 'map-pin', {
    short: 'The installer finder, a page for each contractor, and quote requests sent to them.',
    what: 'Homeowners who would rather not do it themselves search by ZIP for a trained contractor, open the contractor\'s own page and ask for a quote. The list of contractors comes from the dealer list and is kept by admins.',
    how: 'Pages in `src/app/contractor/`, logic in `src/lib/contractors/`. Four of the flows here are model-checked with pstack statecharts.',
    files: ['src/app/contractor', 'src/lib/contractors'],
  }),
  area('store', 'Store and orders', 6, 16, '#4ADE80', 'shopping-cart', {
    short: 'The kit builder and product pages hand off to Shopify; orders come back and are kept in a local copy.',
    what: 'Customers build a kit on the site and pay on Shopify (buy.crazyseal.com). Shopify tells the site about every order and customer, so the admin and the Pro Hub can show them without asking Shopify each time.',
    how: 'Storefront API for the cart (`src/lib/shopify/storefront.ts`), Admin API and webhooks for the copy (`sync.ts`).',
    files: ['src/lib/shopify', 'src/lib/store'],
  }),
  area('warranty', 'Warranty', 12, -2, '#F472B6', 'shield', {
    short: 'Register a roof, claim against it, or transfer it to a new owner.',
    what: 'Customers and pros register finished roofs (with photos) to start the warranty. Claims and transfers come in through their own forms. Each registration gets a certificate.',
    how: 'Routes under `src/app/api/warranty/`, logic and the certificate PDF in `src/lib/warranty/`. Old Gravity Forms registrations were imported and keep their original photo paths.',
    files: ['src/app/api/warranty', 'src/lib/warranty'],
  }),
  area('pro', 'Pro Hub', 12, 10, '#FACC15', 'badge-check', {
    short: 'Where contractors and dealers sign in: their jobs, orders, warranty registrations, support and perks.',
    what: 'The partner side of the site at /pro. A pro signs up, signs in with a password or an emailed link, and sees their own orders and jobs. A newer dealer portal at /portal is built but still runs on demo data.',
    how: 'Session and sign-in in `src/lib/pro/`; the Pro Hub reads its data through `/api/pro/*`. Who can get into an account is model-checked (pro-access).',
    files: ['src/app/pro', 'src/lib/pro', 'src/app/api/pro'],
    route: '/pro',
  }),
  area('admin', 'Admin portal', 12, 22, '#F87171', 'gauge', {
    short: 'The staff side: leads, orders, customers, dealers, contractors, warranties, support and site settings.',
    what: 'Crazy Seal staff run the business from /portal/admin. Each section is a list with a detail page, and every change is checked against the staff member\'s role.',
    how: 'Pages in `src/app/portal/admin/`, server actions and queries in `src/lib/portal/admin/` (one file per section), staff check in `src/lib/admin/require-staff.ts`.',
    files: ['src/app/portal/admin', 'src/lib/portal/admin', 'src/lib/admin/require-staff.ts'],
    route: '/portal/admin',
    status: 'admin-only',
  }),
  area('data', 'Data and media', 18, 1, '#6E8BFF', 'database', {
    short: 'Supabase holds the records; S3 and CloudFront hold the photos and videos.',
    what: 'One Postgres database (Supabase) for leads, tracking, warranties, contractors, the Shopify copy, support and staff. Media lives in the `crazy-seal-media` bucket behind media.crazyseal.com.',
    how: 'Migrations in `supabase/migrations/`, applied with `scripts/apply-migration.mjs`. Server code uses the admin client; the public never reads tables directly.',
    files: ['supabase/migrations', 'src/lib/supabase', 'scripts/apply-migration.mjs'],
  }),
  area('outside', 'Outside services', 18, 13, '#94A3B8', 'cloud', {
    short: 'Shopify, Zoho CRM, Gmail, Meta, Google Ads, Cloudflare Turnstile and the AI models.',
    what: 'The services the site depends on but does not run. Each one has a small client in `src/lib/` so the rest of the code never talks to them directly.',
    how: 'Credentials are server-only env vars (names listed in `.env.local.example`); `npm run env:check` reports which are missing without printing values.',
    files: ['.env.local.example', 'scripts/check-env.mjs'],
  }),

  // ---------------------------------------------------------------- public site
  { id: 'site.pages', parent: 'site', label: 'Application pages', short: 'A page for each kind of roof, from RVs to shipping containers.', what: 'Sixty-odd pages that show the coating on one kind of roof, with photos, steps and a call to action.', files: ['src/app/rv-roofs', 'src/app/sheds', 'src/app/shipping-containers'], links: ['forms.form', 'store.kit'] },
  { id: 'site.help', parent: 'site', label: 'Installation help', short: 'How-to steps, technical data and resources.', files: ['src/app/installation', 'src/app/technical-data', 'src/app/resources'], links: ['assistant.customer'] },
  { id: 'site.proof', parent: 'site', label: 'Reviews and projects', short: 'Google reviews and a gallery of finished roofs.', files: ['src/app/reviews', 'src/app/projects'], links: ['data.media'] },
  { id: 'site.redirects', parent: 'site', label: 'Old addresses', short: 'Every WordPress address still lands on the right page.', how: 'A redirect table in code plus admin-managed redirects in the database.', files: ['src/lib/redirects.ts', 'src/app/portal/admin/redirects'], links: ['admin.settings'] },

  // ---------------------------------------------------------------- tracking
  { id: 'tracking.visits', parent: 'tracking', label: 'Visits and page views', short: 'First touch, last touch and every page in between.', how: '`/api/tracking/session`, `/pageview`, `/event` and `/identify`.', files: ['src/lib/tracking/client.ts', 'src/app/api/tracking'], links: ['data.db'] },
  { id: 'tracking.conversions', parent: 'tracking', label: 'Ad conversions', short: 'Tells Meta and Google Ads when a visit becomes a lead.', how: 'Meta Pixel in the browser, Meta Conversions API from the server, Google Ads through GTM.', files: ['src/lib/tracking/meta-capi.ts', 'src/lib/tracking/meta-pixel.ts', 'src/lib/tracking/google-ads.ts'], links: ['outside.ads'] },
  { id: 'tracking.ops', parent: 'tracking', label: 'Numbers for Company Engineers', short: 'A read-only snapshot of leads and sales for the Company Engineers command center.', how: '`GET /api/ops/snapshot`, signed with a shared secret.', files: ['src/app/api/ops/snapshot/route.ts', 'src/lib/ops/snapshot.ts'], links: ['data.db'] },

  // ---------------------------------------------------------------- assistant
  { id: 'assistant.customer', parent: 'assistant', label: 'Site chat', short: 'Answers customers on crazyseal.com, with a human check and rate limits.', files: ['src/app/api/assistant/chat/route.ts', 'src/lib/ai/guard.ts'], links: ['assistant.handoff', 'outside.ai'] },
  { id: 'assistant.handoff', parent: 'assistant', label: 'Hand-off to a person', short: 'A customer asks for a person; the chat lands in the support inbox.', files: ['src/app/api/assistant/handoff/route.ts', 'src/lib/support'], links: ['admin.support'] },
  { id: 'assistant.screen', parent: 'assistant', label: 'Chat screening', short: 'Each finished customer chat is read again and flagged for staff when needed.', files: ['src/lib/ai/screen.ts'], links: ['admin.support'] },

  // ---------------------------------------------------------------- forms
  { id: 'forms.form', parent: 'forms', label: 'Contact and quote forms', short: 'The forms on every page, with the Turnstile bot check.', files: ['src/components/forms', 'src/lib/turnstile.ts'], links: ['forms.leads'] },
  { id: 'forms.leads', parent: 'forms', label: 'Saving a lead', short: 'Saved with its attribution first, then sent on.', how: '`POST /api/leads`: insert first, then Zoho and Meta in the background, so a slow service never loses a lead.', files: ['src/app/api/leads/route.ts'], links: ['data.db', 'outside.zoho', 'outside.gmail', 'tracking.conversions'] },
  { id: 'forms.applications', parent: 'forms', label: 'Dealer applications', short: 'Businesses apply to sell or install Crazy Seal.', files: ['src/lib/applications/config.ts', 'src/app/business-accelerator-program'], links: ['admin.dealers'] },

  // ---------------------------------------------------------------- contractors
  { id: 'contractors.finder', parent: 'contractors', label: 'Contractor finder', short: 'Search by ZIP or your location; the nearest contractors first.', route: '/contractor', files: ['src/components/contractor/ContractorFinder.tsx', 'src/lib/contractors/geo.ts', 'src/app/api/contractors/zip/route.ts'], links: ['contractors.page'], flows: ['contractor-finder'] },
  { id: 'contractors.page', parent: 'contractors', label: "A contractor's page", short: 'Their own page with their logo, area and a quote form.', route: '/contractor/<address>', files: ['src/app/contractor/[slug]/page.tsx', 'src/components/contractor/ContractorLanding.tsx'], links: ['contractors.quote'] },
  { id: 'contractors.quote', parent: 'contractors', label: 'Quote requests', short: 'Saved, then emailed to the contractor, with a copy to Crazy Seal; unsent ones are sent again daily.', how: '`/api/contractors/quote`, `notifyQuote` in `after()`, and the daily `/api/cron/contractor-quotes`.', files: ['src/components/contractor/QuoteForm.tsx', 'src/app/api/contractors/quote/route.ts', 'src/lib/contractors/quote.ts', 'src/app/api/cron/contractor-quotes/route.ts'], links: ['data.db', 'outside.gmail'], flows: ['quote-requests'] },
  { id: 'contractors.records', parent: 'contractors', label: 'Contractor records', short: 'The dealer-list import and admin edits keep one page per dealer.', how: '`scripts/import-contractors.mjs` and the admin contractor actions.', files: ['scripts/import-contractors.mjs', 'src/lib/portal/admin/contractor-actions.ts', 'src/lib/contractors/slug.ts'], links: ['admin.dealers'], flows: ['contractor-records'] },

  // ---------------------------------------------------------------- store
  { id: 'store.kit', parent: 'store', label: 'Kit builder', short: 'Answer a few questions about the roof; get the right kit.', route: '/kit-builder', files: ['src/app/kit-builder/page.tsx', 'src/components/KitBuilder.tsx', 'src/lib/store/kit-builder.ts'], links: ['store.checkout'] },
  { id: 'store.products', parent: 'store', label: 'Product pages', short: 'Products and prices read from Shopify.', route: '/store', files: ['src/app/store', 'src/lib/shopify/catalog.ts'], links: ['store.checkout'] },
  { id: 'store.checkout', parent: 'store', label: 'Checkout hand-off', short: 'Builds a Shopify cart with the visit attached, then sends the shopper to pay.', files: ['src/app/api/store/checkout/route.ts', 'src/lib/shopify/storefront.ts'], links: ['outside.shopify'] },
  { id: 'store.copy', parent: 'store', label: 'Local copy of orders', short: 'Shopify webhooks and an admin refresh keep a copy of orders and customers.', how: 'Webhooks are checked with HMAC, then `fetchAndUpsertOrder` reads the order fresh from Shopify; deletes are kept as marks.', files: ['src/app/api/shopify/webhooks/route.ts', 'src/lib/shopify/sync.ts'], links: ['data.db'], flows: ['shopify-copy'] },

  // ---------------------------------------------------------------- warranty
  { id: 'warranty.register', parent: 'warranty', label: 'Register a roof', short: 'Photos and details start the warranty; the customer gets a certificate.', route: '/warranty', files: ['src/app/warranty/page.tsx', 'src/app/api/warranty/register/route.ts', 'src/lib/warranty/certificate.ts'], links: ['data.db', 'data.media', 'outside.gmail'] },
  { id: 'warranty.claim', parent: 'warranty', label: 'Claims', short: 'A customer reports a problem with a registered roof.', files: ['src/app/api/warranty/claim/route.ts'], links: ['admin.warranties'] },
  { id: 'warranty.transfer', parent: 'warranty', label: 'Transfers', short: 'The warranty moves to a new owner when the property sells.', route: '/warranty-transfer', files: ['src/app/warranty-transfer/page.tsx', 'src/app/api/warranty/transfer/route.ts'], links: ['admin.warranties'] },

  // ---------------------------------------------------------------- pro hub
  { id: 'pro.access', parent: 'pro', label: 'Signing in', short: 'Sign-up, password or emailed link; only the owner of the email gets in.', files: ['src/lib/pro/auth.ts', 'src/app/api/pro/auth', 'src/lib/pro/signup-guard.ts'], links: ['pro.home'], flows: ['pro-access'] },
  { id: 'pro.home', parent: 'pro', label: 'Jobs and orders', short: "A pro's own jobs, orders and warranty registrations.", files: ['src/app/pro/jobs', 'src/app/pro/orders', 'src/app/api/pro/orders/route.ts'], links: ['store.copy', 'warranty.register'] },
  { id: 'pro.support', parent: 'pro', label: 'Pro support', short: 'Tickets and chats with the Crazy Seal team.', files: ['src/app/pro/support', 'src/app/api/pro/support'], links: ['admin.support'] },
  { id: 'pro.portal', parent: 'pro', label: 'Contractor portal', short: 'The contractor portal that replaced Pro Hub: roofs, pipeline, customers, quotes, jobs, orders, warranties, training and team.', how: 'Every Pro account signs in here (`portalSignIn` in `src/lib/contractor/guard.ts`); old /pro pages redirect. Roles and menus come from `src/lib/contractor/roles.ts` and `nav.ts`.', files: ['src/app/portal/(app)', 'src/lib/contractor/guard.ts', 'src/lib/contractor/roles.ts'] },

  // ---------------------------------------------------------------- admin
  { id: 'admin.leads', parent: 'admin', label: 'Leads', short: 'Every form lead with where it came from.', status: 'admin-only', files: ['src/app/portal/admin/leads', 'src/lib/portal/admin/leads.ts'], links: ['data.db'] },
  { id: 'admin.orders', parent: 'admin', label: 'Orders and customers', short: 'Read from the local Shopify copy, with a refresh button.', status: 'admin-only', files: ['src/app/portal/admin/orders', 'src/app/portal/admin/customers', 'src/lib/portal/admin/refresh.ts'], links: ['store.copy'] },
  { id: 'admin.dealers', parent: 'admin', label: 'Dealers and contractors', short: 'Applications, the accelerator program, and each contractor page.', status: 'admin-only', files: ['src/app/portal/admin/dealers', 'src/lib/portal/admin/dealers.ts'], links: ['contractors.records'] },
  { id: 'admin.viewas', parent: 'admin', label: 'View as', short: "An admin opens a dealer's Pro Hub, read-only, and every view is logged.", status: 'admin-only', files: ['src/lib/pro/view-as.ts', 'src/app/api/admin/view-as/route.ts', 'src/lib/portal/admin/access-log.ts'], links: ['pro.home'], flows: ['view-as'] },
  { id: 'admin.warranties', parent: 'admin', label: 'Warranties', short: 'Registrations, claims and transfers, with review status.', status: 'admin-only', files: ['src/app/portal/admin/warranties', 'src/lib/portal/admin/warranty.ts'], links: ['data.db'] },
  { id: 'admin.support', parent: 'admin', label: 'Support inbox', short: 'Hand-offs from the site chat and Pro Hub tickets in one place.', status: 'admin-only', files: ['src/app/portal/admin/support', 'src/lib/support/admin.ts'], links: ['data.db'] },
  { id: 'admin.settings', parent: 'admin', label: 'Staff and site settings', short: 'Staff and roles, redirects, the sitemap, assets and the AI settings.', status: 'admin-only', files: ['src/app/portal/admin/staff', 'src/lib/portal/admin/permissions.ts', 'src/app/portal/admin/assets'], links: ['data.media'] },

  // ---------------------------------------------------------------- data
  { id: 'data.db', parent: 'data', label: 'Database', short: 'Supabase Postgres: leads, tracking, warranties, contractors, orders, support, staff.', how: 'Numbered migrations in `supabase/migrations/`; table access goes through server code (migration 029 removed direct access).', files: ['supabase/migrations', 'src/lib/supabase'], shape: 'store' },
  { id: 'data.media', parent: 'data', label: 'Photos and videos', short: 'S3 behind media.crazyseal.com; uploads are presigned, videos go through MediaConvert.', files: ['src/app/api/upload', 'src/lib/storage/site-assets.ts', 'src/app/api/admin/mediaconvert'], shape: 'store' },

  // ---------------------------------------------------------------- outside
  { id: 'outside.shopify', parent: 'outside', label: 'Shopify', short: 'The store at buy.crazyseal.com: products, carts, payments, orders.', files: ['src/lib/shopify/admin.ts', 'src/lib/shopify/storefront.ts'], links: ['store.copy'] },
  { id: 'outside.zoho', parent: 'outside', label: 'Zoho CRM', short: 'Every lead becomes a CRM lead with an owner.', files: ['src/lib/zoho/client.ts', 'scripts/zoho-setup.mjs'] },
  { id: 'outside.gmail', parent: 'outside', label: 'Gmail', short: 'Team notifications, auto-replies and quote emails.', files: ['src/lib/email/gmail.ts', 'scripts/gmail-setup.mjs'] },
  { id: 'outside.ads', parent: 'outside', label: 'Meta and Google Ads', short: 'Where conversions are reported and ad spend is read.', files: ['src/lib/meta/ads.ts', 'src/lib/tracking/meta-capi.ts'] },
  { id: 'outside.ai', parent: 'outside', label: 'AI models', short: 'OpenAI through the Vercel AI Gateway, or Anthropic.', files: ['src/lib/ai/providers.ts', 'src/lib/ai/config.ts'] },
])

CODEBASE_MAP.edges.push(
  ['site', 'forms', 'a visitor sends a form'],
  ['site', 'contractors', 'a visitor looks for an installer'],
  ['site', 'store', 'a shopper builds a kit'],
  ['site', 'warranty', 'a customer registers a roof'],
  ['site', 'assistant', 'a visitor asks a question'],
  ['site', 'tracking', 'every visit is recorded'],
  ['tracking', 'outside', 'conversions go to Meta and Google'],
  ['forms', 'data', 'the lead is saved first'],
  ['forms', 'outside', 'then sent to Zoho and Gmail'],
  ['contractors', 'outside', 'the contractor is emailed'],
  ['store', 'outside', 'the shopper pays on Shopify'],
  ['outside', 'store', 'Shopify reports each order'],
  ['warranty', 'data', 'photos and details are stored'],
  ['pro', 'store', 'a pro sees their orders'],
  ['pro', 'warranty', 'a pro registers a job'],
  ['admin', 'contractors', 'staff edit contractor pages'],
  ['admin', 'pro', "staff view a dealer's hub"],
  ['assistant', 'admin', 'a chat is handed to a person'],
)

CODEBASE_MAP.tours.push(
  {
    id: 'ad-to-lead',
    title: 'From an ad to a lead in the CRM',
    blurb: 'One visitor, from the first click to a sales rep\'s inbox.',
    steps: [
      { node: 'tracking.visits', text: 'Someone clicks an ad. The first visit is remembered with the ad it came from, so the lead can be traced back to it weeks later.' },
      { node: 'site.pages', text: 'They read the page for their kind of roof, say an RV, with photos of finished roofs and the steps to do it.' },
      { node: 'forms.form', text: 'They send the quote form. Cloudflare Turnstile checks they are a person before anything is saved.' },
      { node: 'forms.leads', text: 'The lead is saved **first**, with the first visit and the visit that converted. Everything after this runs in the background, so a slow service never loses a lead.' },
      { node: 'data.db', text: 'The lead is now a row in Supabase. The admin Leads page reads it from here.' },
      { node: 'outside.zoho', text: 'It is pushed to Zoho CRM with an owner, so a sales rep picks it up.' },
      { node: 'outside.gmail', text: 'The team gets an email and the visitor gets an automatic reply.' },
      { node: 'tracking.conversions', text: 'Meta hears about the lead from the server (Conversions API), so the ad gets credit even when the browser blocks the pixel.' },
    ],
  },
  {
    id: 'quote-request',
    title: 'A homeowner asks a contractor for a quote',
    blurb: 'Finder, contractor page, quote form, and the emails that must not get lost.',
    steps: [
      { node: 'contractors.finder', text: 'A homeowner searches by ZIP or shares their location. The nearest contractors come first. The finder only ever shows the answer to the latest search (checked: contractor-finder).' },
      { node: 'contractors.page', text: "They open a contractor's own page. If an admin renamed it, the old address still works." },
      { node: 'contractors.quote', text: 'They send the quote form. The request is saved, and the visitor is told it is on its way.' },
      { node: 'data.db', text: 'Saved with two stamps: when the contractor was emailed, and when Crazy Seal was. A request with neither counts as waiting to send.' },
      { node: 'outside.gmail', text: 'The contractor gets the email, with reply-to set to the homeowner. If that fails, Crazy Seal gets a copy to pass it on.' },
      { node: 'contractors.quote', text: 'If both emails failed, or the server stopped right after answering, the daily job sends it again. No request is lost (checked: quote-requests).' },
      { node: 'admin.dealers', text: "Staff see the request on the contractor's admin page and can press Send again." },
    ],
  },
  {
    id: 'kit-to-order',
    title: 'From the kit builder to an order in the Pro Hub',
    blurb: 'How an order made on Shopify comes back to the site.',
    steps: [
      { node: 'store.kit', text: 'A customer answers a few questions about their roof and gets the right kit.' },
      { node: 'store.checkout', text: 'The site builds a Shopify cart with the visit attached, so marketing can match the order to the ad.' },
      { node: 'outside.shopify', text: 'They pay on buy.crazyseal.com. Shopify, not the site, handles the money.' },
      { node: 'store.copy', text: 'Shopify sends a webhook. The site checks its signature, reads the order fresh from Shopify and saves the copy. A deleted order stays deleted, and an older update never overwrites a newer one (checked: shopify-copy).' },
      { node: 'admin.orders', text: 'Staff see the order in the admin without waiting on Shopify.' },
      { node: 'pro.home', text: 'If the buyer is a pro, the order shows in their Pro Hub too.' },
    ],
  },
)
