# Crazy Seal Admin: UI variation brief

You are designing ONE alternative look for the Crazy Seal Admin, an internal
dashboard the owners of Crazy Seal (a roof-coating brand) use to see Shopify
sales and their dealer program. Six designers get this same brief, each with a
different direction, so the owner can compare ideas side by side.

## What the owner said about today's version

- Likes the simplicity and the compactness. Keep it dense.
- "Something is just a little bit missing as far as being modernized." The
  components (panels, stat tiles, badges, tables, nav) look a bit outdated.
- "It's a lot of blue." Today everything is navy-on-navy with blue borders and
  blue-tinted text. Pull back on blue.
- Wants clear flow and separation between navigation groups and between
  components: crisp borders, obvious grouping.
- Minimal, modern, a bit of gradient, little wasted space inside components.

## Today's implementation (read these to understand the app; do NOT edit them)

- `../../src/components/portal/admin/ui.tsx` (Panel, Stat, Table, Badge, Segmented...)
- `../../src/components/portal/admin/AdminShell.tsx` (sidebar, top bar)
- `../../src/app/portal/admin/page.tsx` (the Overview page you are redesigning)
- `../../src/components/portal/admin/charts.tsx` (column chart)

Brand colours: navy `#003365`, blue `#125F97`, green `#5BA411` / `#6DC015`,
yellow `#F9EA1C`. Fonts used on the site: Inter (body), Plus Jakarta Sans
(display). You may use other Google Fonts if your direction calls for it.
You do not have to use every brand colour; blue should no longer dominate.

## The screen to build: Overview

One self-contained HTML file showing the full admin shell plus the Overview
page, filled with the sample data below (identical across all six designs).

### Shell
- Brand: "Crazy Seal" + "Admin".
- Navigation, in this order, with these groups:
  - Overview (active)
  - SALES: Orders (badge "9" open), Customers, Products, Sales history,
    Discounts, Abandoned carts
  - DEALERS: Dealer roster, Portal accounts, Applications (badge "28" new)
  - TOOLS: Dealer portal demo, Leads, Shopify admin (external)
  - Footer: signed in as "Eric", "Owner", sign-out.
- Top bar: breadcrumb "Admin / Overview", a search field
  ("Search orders, customers…"), a sync button showing "Synced 2 min ago".
- At 375px wide the nav collapses into a drawer behind a menu button. No
  horizontal page scroll at any width; wide tables scroll inside their panel.

### Page content (you may rearrange the layout)
- Title "Overview", subtitle "Sales from Shopify, last 30 days (Sep 27 – Oct 26, 2026)".
- Range control: 7 days · 30 days (selected) · 90 days · Year to date · All time.
- 6 KPIs with change vs the previous 30 days:
  - Sales $100,242, +18.4%
  - Orders 76, +8.6%
  - Avg. order $1,319, +9.0%
  - Units sold 412, +11.2%
  - New customers 41, -4.7%
  - Refunds $1,920, -32.0% (down is good here, so show it as positive)
- Daily sales chart, Sep 27 – Oct 26 (30 values, in order):
  2140, 3880, 1260, 4920, 3310, 2780, 960, 1450, 5210, 3990, 2870, 4410, 3150,
  880, 1720, 6140, 3560, 2990, 4780, 3820, 1340, 2260, 5890, 4130, 3270, 4650,
  3990, 1180, 2410, 6902
- Sales by channel: Online Store $71,402 (52 orders) · Draft orders $22,310
  (17) · Shop app $4,118 (5) · Point of Sale $2,412 (2)
- Top products (30 days): Roof Coating 5 Gal $41,880 (96 units) · Roof Coating
  1 Gal $16,240 (151) · Primer 1 Gal $9,610 (62) · Fabric Tape 6" $6,980 (88) ·
  Complete Roof Kit $5,400 (12) · Seam Sealer Caulk $2,310 (77)
- Top states: FL $21,480 · TX $14,920 · AZ $9,870 · GA $7,640 · NC $6,210 · CA $5,330
- Waiting to ship: 9 orders, oldest 4 days.
- Recent orders table (columns: Order, Date, Customer, Payment, Fulfillment, Total):
  | #7095 | Oct 26 | Marcus Hale (Hale Roofing LLC) | Paid | Unfulfilled | $2,418.60 |
  | #7094 | Oct 26 | Dana Whitfield | Paid | Fulfilled | $349.00 |
  | #7093 | Oct 25 | Coastal Pro Coatings, tag Dealer | Pending | Unfulfilled | $5,812.40 |
  | #7092 | Oct 25 | Robert King | Paid | Fulfilled | $1,129.95 |
  | #7091 | Oct 24 | Lisa Tran | Refunded | Fulfilled | $189.00 |
  | #7090 | Oct 24 | Ridgeline RV Service, tag Dealer | Paid | Partially fulfilled | $3,960.00 |
  | #7089 | Oct 23 | Tom Becker | Paid | Fulfilled | $612.50 |
  | #7088 | Oct 23 | Alicia Gomez | Paid | Unfulfilled | $1,488.00 |
  | #7087 | Oct 22 | Sun Valley HOA, tag Commercial | Partially paid | Unfulfilled | $7,240.00 |
  | #7086 | Oct 22 | Kevin Marsh | Paid | Fulfilled | $274.99 |
- Dealer snapshot: 22 dealers · $124K lifetime sales · 1.8% of all sales ·
  0 dealers on the Pro Hub · 13 Pro Hub accounts · 28 applications to review.
- Abandoned carts: 40 carts worth $80,632.

## Hard rules

- Density stays high: panel headers about 32–36px, table rows about 30–34px,
  body text 12–13px, small inner padding. Compact is a feature.
- Modernise the components themselves: typography (tabular numbers, tight
  tracking), refined badges, segmented control, stat tiles (sparklines welcome),
  table styling, hover and focus states, a little gradient and depth.
- Clear separation: nav groups and panels must read as distinct blocks.
- Charts: inline SVG, a single y-axis, rounded column tops, recessive grid,
  a hover tooltip. Text and numbers never take the series colour.
- Body text contrast at least 4.5:1 against its background.
- Single self-contained HTML file. Hand-written CSS (custom properties) and
  vanilla JS only. Google Fonts allowed. Icons as inline SVG. No images, no
  other external scripts or libraries.
- Start the file with an HTML comment naming the direction and its key ideas.
- Write ONLY your own output file in this folder. Do not edit anything else,
  do not run git, do not install packages, do not start servers.
- Your final message: 4–6 short bullets naming the ideas worth stealing.

## Round 2 (designs 07–13): blue and yellow

The owner saw six directions (`01`–`06` in this folder) and is not sold yet.
Round 2 explores the brand's own **blue and yellow**, either together or one
of them on its own. Blue is welcome again, but on purpose: as an accent, a
zone, a gradient or ink. Never the old navy-on-navy-everything with blue
borders and blue-tinted text. Glance at `01`–`06` so you don't repeat them.
Brand blues: navy `#003365`, dark navy `#002043`, blue `#125F97`, bright blue
`#1A7BC4`. Brand yellows: `#F9EA1C`, light `#FDF388`, dark `#C7BA16`. Green
`#5BA411` may still mark "good" (positive change, Paid), but keep it minor.
Yellow on white fails contrast for text: use it for fills, marks and
highlights behind dark text, never as text colour on light backgrounds.
