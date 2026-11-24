-- ============================================================================
-- The 2027 price list, editable in the database (Admin > Pricing).
--
-- pricing_settings.price_list: Crazy Seal's prices and costs, per unit
--   (gallon, tube, 25 ft roll; a tote per gallon):
--     retail:  small projects (roofs under the first band, and every RV roof):
--              seal, patch, caulk; clean and tape null (the sheet has no
--              retail price for them: retail quotes use the project price).
--     bands:   project prices by roof size, [{minSqft, maxSqft (null: no
--              top), perGallon}], for Crazy Seal and Crazy Patch.
--     tote:    {gallons, perGallon}: once a job needs a tote's worth of
--              Crazy Seal, whole totes at this price and pails for the rest.
--     project: caulk, clean, tape on project-priced quotes.
--     costs:   Crazy Seal's material cost (Thermo's price) per unit, for
--              seal, patch, caulk, clean, tape and tote. Staff only.
--   The default is the 2027 sheet. Quotes no longer price from
--   default_markup (kept for the record); a price_book row can still turn a
--   variant off, override its cost, or with a markup fix its price.
-- pricing_settings.job_discounts: contractor discounts by their Crazy Seal
--   order count (not cancelled), [{minOrders, pct}]: 26+ orders 20%, 51+
--   30%. They replace the live offer (offer_discount_pct, 10% for everyone);
--   a quote gets the single best of the live offer, the order-count discount
--   and the contractor's assigned tier.
-- pricing_settings.free_shipping_over: free shipping from this discounted
--   total ($750) up to free_shipping_under ($3,500, where freight starts);
--   below it the buyer pays shipping at checkout.
--
-- Every quote's price is a live offer: expires_at = priced_at + offer_hours
-- (72); after that it can be refreshed at the day's prices.
--
-- Additive and safe to re-run: it adds the columns where missing and fills
-- them on the existing row only where they're still empty. The app reads
-- pricing_settings with select('*') and uses the same 2027 defaults until
-- this is applied (src/lib/pricing/price-list-2027.ts).
--
-- Applied to the live database 2026-11-23.
-- ============================================================================

BEGIN;

ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS price_list JSONB NOT NULL DEFAULT '{
  "retail": {"seal": 225, "patch": 225, "caulk": 25, "clean": null, "tape": null},
  "bands": [
    {"minSqft": 1500, "maxSqft": 5000, "perGallon": 145},
    {"minSqft": 5001, "maxSqft": 10000, "perGallon": 135},
    {"minSqft": 10001, "maxSqft": null, "perGallon": 120}
  ],
  "tote": {"gallons": 275, "perGallon": 100},
  "project": {"caulk": 12, "clean": 30, "tape": 48},
  "costs": {"seal": 60, "patch": 60, "caulk": 6, "clean": 15, "tape": 28, "tote": 50}
}';

ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS job_discounts JSONB NOT NULL DEFAULT '[
  {"minOrders": 26, "pct": 20},
  {"minOrders": 51, "pct": 30}
]';

ALTER TABLE pricing_settings ADD COLUMN IF NOT EXISTS free_shipping_over NUMERIC(12,2) NOT NULL DEFAULT 750;

DO $$
BEGIN
  ALTER TABLE pricing_settings ADD CONSTRAINT pricing_settings_price_list_check
    CHECK (jsonb_typeof(price_list) = 'object' AND jsonb_typeof(job_discounts) = 'array' AND free_shipping_over >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- The existing row: ADD COLUMN ... DEFAULT already filled it; this covers a
-- column added earlier by hand without one.
UPDATE pricing_settings
   SET price_list = '{
         "retail": {"seal": 225, "patch": 225, "caulk": 25, "clean": null, "tape": null},
         "bands": [
           {"minSqft": 1500, "maxSqft": 5000, "perGallon": 145},
           {"minSqft": 5001, "maxSqft": 10000, "perGallon": 135},
           {"minSqft": 10001, "maxSqft": null, "perGallon": 120}
         ],
         "tote": {"gallons": 275, "perGallon": 100},
         "project": {"caulk": 12, "clean": 30, "tape": 48},
         "costs": {"seal": 60, "patch": 60, "caulk": 6, "clean": 15, "tape": 28, "tote": 50}
       }'::jsonb
 WHERE id AND (price_list IS NULL OR price_list = '{}'::jsonb);

INSERT INTO pricing_settings (id) VALUES (TRUE) ON CONFLICT (id) DO NOTHING;

COMMIT;
