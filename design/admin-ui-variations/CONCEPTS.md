# Crazy Seal Admin: image concepts (round 4)

Generate **images** (UI mockups), not code. Each image is one high-fidelity
screenshot-style mockup of the Crazy Seal Admin "Overview" screen, landscape
1536×1024, like a polished Dribbble / product-launch shot of a real 2026 SaaS
dashboard, shown flat and full-frame (no device frame, no perspective, no
hands, no desk).

## The owner's taste so far
- Liked: the "Aurora Glass" vibe (dark, soft glowing gradient light behind
  frosted panels) in two colourways, Brand Blue and Navy & Gold. The two
  attached screenshots show them.
- Wants: compact, dense, minimal panels; clear borders between nav groups
  and between panels; a subtly coloured sidebar; modern gradients; gold
  accents. Not too much plain navy-on-navy.
- Now exploring the **logo colours**: the Crazy Seal logo is a seal in
  green (`#60A818`, lime highlight `#90D830`) and blue (`#186090`, bright
  `#3090D8`), black outline, silver, a touch of yellow. Gold accent for
  the admin: around `#F2C230` to `#F9D423`.

## Content every image must show (keep the text short and legible)
- Brand "Crazy Seal" + "Admin" with a small seal/shield mark.
- Navigation: Overview; SALES: Orders (9), Customers, Products, Sales
  history, Discounts, Abandoned carts; DEALERS: Dealer roster, Portal
  accounts, Applications (28); TOOLS: Dealer portal demo, Leads, Shopify.
  Signed in as Eric, Owner.
- Top: breadcrumb "Admin / Overview", a search field, "Synced 2 min ago".
- Title "Overview", range control 7d · 30d (selected) · 90d · YTD · All.
- KPIs: Sales $100,242 (+18.4%), Orders 76 (+8.6%), Avg. order $1,319
  (+9.0%), Units 412 (+11.2%), New customers 41 (−4.7%), Refunds $1,920.
- Daily sales column chart for the last 30 days (about $1k–$7k per day).
- Sales by channel: Online Store $71,402 · Draft orders $22,310 · Shop app
  $4,118 · Point of Sale $2,412.
- Recent orders table (#7095 to #7088 with names, Paid / Pending / Refunded,
  Fulfilled / Unfulfilled badges, totals).
- Dealer snapshot: 22 dealers · $124K lifetime · 28 applications to review.
- "9 orders waiting to ship" call-out.

## Rules
- Compact density: small UI text (11–13px look), tight panels, 32px rows.
- Crisp 1px borders between panels and nav groups.
- Gold used as an accent (selected states, a hero number, call-outs,
  highlights), never as a big background area unless the concept says so.
- Spell all text correctly; prefer fewer words over garbled words.
- No real people photos, no stock imagery, no lorem ipsum.

## The 12 concepts
| id | slug | colour lead | layout idea |
|----|------|-------------|-------------|
| 14 | seal-green-aurora | Green primary, gold accents, dark | Aurora Glass layout (left sidebar, KPI row, chart + channel column, orders table) but in logo green with a gold Sales number and gold selected range; sidebar tinted deep green |
| 15 | field-green-light | Green primary, gold accents, light | Light theme, **top horizontal navigation** instead of a sidebar (Sales / Dealers / Tools as tab groups with dropdowns), full-width KPI strip, wide chart |
| 16 | emerald-bento | Green primary, gold accents, dark | **Icon rail + bento grid**: 56px icon rail, tiles of mixed sizes, big Sales tile with sparkline, monospace numbers |
| 17 | green-on-navy | Green primary on a navy shell, gold accents | Navy sidebar and top bar, charcoal content, green chart and Paid badges, gold for the hero KPI and call-outs |
| 18 | brand-blue-plus | Blue primary, gold accents, dark | Evolution of the attached Brand Blue: same layout, richer blue glass sidebar, gold active-nav bar and gold "28 applications" pill, glowing blue chart |
| 19 | harbor-light-split | Blue primary, gold accents, light | Light theme, **master-detail layout**: left nav, middle column = orders list, right column = selected order detail drawer with KPIs on top |
| 20 | navy-command | Blue primary, gold accents, dark navy | **Command-center** layout: top nav with large tabs, a full-width hero chart band with KPIs overlaid, then three equal columns (orders, channels, dealers) |
| 21 | blue-horizon | Blue primary, gold accents, light/dark mix | A **blue gradient header band** across the top holding the title, range and KPI tiles in white glass cards; white content below; slim floating sidebar |
| 22 | logo-duo-dark | Blue + green together (logo duo), gold accents, dark | Blue-tinted sidebar, green for money/positive data, blue for navigation and links, gold for attention; Aurora glass panels |
| 23 | seal-duo-light | Blue + green together, gold accents, light | White canvas, a slim green-to-blue gradient bar at the top, blue sidebar text, green chart, gold primary button |
| 24 | gradient-rail | Green→blue gradient, gold accents, dark | **Floating card sidebar** (rounded, detached from the edge) with a green-to-blue gradient border, dense tables, KPI chips in a single row |
| 25 | navy-gold-three-col | Navy & Gold evolution with green success, dark | **Three-column** layout: left nav, main content, and a right "activity" rail (latest orders, dealer applications, sync status) |

Save every image into `./concepts/` as `<id>-<slug>.png`.
