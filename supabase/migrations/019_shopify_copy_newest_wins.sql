-- The local copy of Shopify keeps the newest version of each customer and order.
--
-- Webhooks, the admin refresh, the full sync and one-off fetches overlap, and a slow one can hold an
-- older version of a record than the one already stored. These functions replace a stored record only
-- when Shopify's updated_at is the same or newer, never bring back a record that was deleted, and
-- replace an order's line items in the same transaction as the order. The same updated_at writes
-- again so a full sync still refreshes rows after the mapping in src/lib/shopify/commerce-map.ts
-- changes. A new column on these tables needs adding to the column lists here.
--
-- Called by the service role only (src/lib/shopify/sync.ts, scripts/backfill-shopify-commerce.mjs).

CREATE OR REPLACE FUNCTION upsert_shopify_customers(p_rows JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  entry JSONB;
  saved UUID;
  written INTEGER := 0;
BEGIN
  FOR entry IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
    saved := NULL;
    INSERT INTO shopify_customers AS c (
      shopify_id, legacy_resource_id, email, phone, first_name, last_name, display_name, note,
      tags, state, locale, tax_exempt, verified_email, number_of_orders, amount_spent,
      amount_spent_currency, default_address, addresses, email_marketing_state, sms_marketing_state,
      is_dealer, is_commercial, shopify_created_at, shopify_updated_at, synced_at, payload
    )
    SELECT
      shopify_id, legacy_resource_id, email, phone, first_name, last_name, display_name, note,
      tags, state, locale, tax_exempt, verified_email, number_of_orders, amount_spent,
      amount_spent_currency, default_address, addresses, email_marketing_state, sms_marketing_state,
      is_dealer, is_commercial, shopify_created_at, shopify_updated_at, synced_at, payload
    FROM jsonb_populate_record(NULL::shopify_customers, entry)
    ON CONFLICT (shopify_id) DO UPDATE SET
      legacy_resource_id = EXCLUDED.legacy_resource_id,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      display_name = EXCLUDED.display_name,
      note = EXCLUDED.note,
      tags = EXCLUDED.tags,
      state = EXCLUDED.state,
      locale = EXCLUDED.locale,
      tax_exempt = EXCLUDED.tax_exempt,
      verified_email = EXCLUDED.verified_email,
      number_of_orders = EXCLUDED.number_of_orders,
      amount_spent = EXCLUDED.amount_spent,
      amount_spent_currency = EXCLUDED.amount_spent_currency,
      default_address = EXCLUDED.default_address,
      addresses = EXCLUDED.addresses,
      email_marketing_state = EXCLUDED.email_marketing_state,
      sms_marketing_state = EXCLUDED.sms_marketing_state,
      is_dealer = EXCLUDED.is_dealer,
      is_commercial = EXCLUDED.is_commercial,
      shopify_created_at = EXCLUDED.shopify_created_at,
      shopify_updated_at = EXCLUDED.shopify_updated_at,
      synced_at = EXCLUDED.synced_at,
      payload = EXCLUDED.payload
    WHERE c.deleted_at IS NULL
      AND (c.shopify_updated_at IS NULL OR EXCLUDED.shopify_updated_at >= c.shopify_updated_at)
    RETURNING c.id INTO saved;

    IF saved IS NOT NULL THEN
      written := written + 1;
    END IF;
  END LOOP;
  RETURN written;
END
$$;

-- Each element of p_orders is an order row with its line item rows under "line_items".
CREATE OR REPLACE FUNCTION upsert_shopify_orders(p_orders JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  entry JSONB;
  items JSONB;
  saved UUID;
  written INTEGER := 0;
BEGIN
  FOR entry IN SELECT value FROM jsonb_array_elements(p_orders) LOOP
    saved := NULL;
    INSERT INTO shopify_orders AS o (
      shopify_id, legacy_resource_id, name, number, confirmation_number, email, phone,
      customer_shopify_id, customer_email, customer_display_name, financial_status,
      fulfillment_status, return_status, cancelled_at, cancel_reason, closed_at, processed_at,
      currency, presentment_currency, subtotal_price, total_price, total_tax, total_discounts,
      total_shipping, total_refunded, total_outstanding, current_total_price, tags, note,
      source_name, po_number, test, taxes_included, tax_exempt, fully_paid, unpaid, confirmed,
      shipping_address, billing_address, shipping_lines, fulfillments, refunds, transactions,
      discount_codes, discount_applications, custom_attributes, payment_gateway_names,
      shopify_created_at, shopify_updated_at, synced_at, payload
    )
    SELECT
      shopify_id, legacy_resource_id, name, number, confirmation_number, email, phone,
      customer_shopify_id, customer_email, customer_display_name, financial_status,
      fulfillment_status, return_status, cancelled_at, cancel_reason, closed_at, processed_at,
      currency, presentment_currency, subtotal_price, total_price, total_tax, total_discounts,
      total_shipping, total_refunded, total_outstanding, current_total_price, tags, note,
      source_name, po_number, test, taxes_included, tax_exempt, fully_paid, unpaid, confirmed,
      shipping_address, billing_address, shipping_lines, fulfillments, refunds, transactions,
      discount_codes, discount_applications, custom_attributes, payment_gateway_names,
      shopify_created_at, shopify_updated_at, synced_at, payload
    FROM jsonb_populate_record(NULL::shopify_orders, entry)
    ON CONFLICT (shopify_id) DO UPDATE SET
      legacy_resource_id = EXCLUDED.legacy_resource_id,
      name = EXCLUDED.name,
      number = EXCLUDED.number,
      confirmation_number = EXCLUDED.confirmation_number,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      customer_shopify_id = EXCLUDED.customer_shopify_id,
      customer_email = EXCLUDED.customer_email,
      customer_display_name = EXCLUDED.customer_display_name,
      financial_status = EXCLUDED.financial_status,
      fulfillment_status = EXCLUDED.fulfillment_status,
      return_status = EXCLUDED.return_status,
      cancelled_at = EXCLUDED.cancelled_at,
      cancel_reason = EXCLUDED.cancel_reason,
      closed_at = EXCLUDED.closed_at,
      processed_at = EXCLUDED.processed_at,
      currency = EXCLUDED.currency,
      presentment_currency = EXCLUDED.presentment_currency,
      subtotal_price = EXCLUDED.subtotal_price,
      total_price = EXCLUDED.total_price,
      total_tax = EXCLUDED.total_tax,
      total_discounts = EXCLUDED.total_discounts,
      total_shipping = EXCLUDED.total_shipping,
      total_refunded = EXCLUDED.total_refunded,
      total_outstanding = EXCLUDED.total_outstanding,
      current_total_price = EXCLUDED.current_total_price,
      tags = EXCLUDED.tags,
      note = EXCLUDED.note,
      source_name = EXCLUDED.source_name,
      po_number = EXCLUDED.po_number,
      test = EXCLUDED.test,
      taxes_included = EXCLUDED.taxes_included,
      tax_exempt = EXCLUDED.tax_exempt,
      fully_paid = EXCLUDED.fully_paid,
      unpaid = EXCLUDED.unpaid,
      confirmed = EXCLUDED.confirmed,
      shipping_address = EXCLUDED.shipping_address,
      billing_address = EXCLUDED.billing_address,
      shipping_lines = EXCLUDED.shipping_lines,
      fulfillments = EXCLUDED.fulfillments,
      refunds = EXCLUDED.refunds,
      transactions = EXCLUDED.transactions,
      discount_codes = EXCLUDED.discount_codes,
      discount_applications = EXCLUDED.discount_applications,
      custom_attributes = EXCLUDED.custom_attributes,
      payment_gateway_names = EXCLUDED.payment_gateway_names,
      shopify_created_at = EXCLUDED.shopify_created_at,
      shopify_updated_at = EXCLUDED.shopify_updated_at,
      synced_at = EXCLUDED.synced_at,
      payload = EXCLUDED.payload
    WHERE o.deleted_at IS NULL
      AND (o.shopify_updated_at IS NULL OR EXCLUDED.shopify_updated_at >= o.shopify_updated_at)
    RETURNING o.id INTO saved;

    CONTINUE WHEN saved IS NULL;
    written := written + 1;
    items := COALESCE(entry -> 'line_items', '[]'::JSONB);

    DELETE FROM shopify_order_line_items li
    WHERE li.order_id = saved
      AND li.shopify_id <> ALL (ARRAY(SELECT i ->> 'shopify_id' FROM jsonb_array_elements(items) i));

    INSERT INTO shopify_order_line_items AS li (
      shopify_id, order_id, order_shopify_id, title, name, sku, vendor, variant_title, quantity,
      current_quantity, unfulfilled_quantity, variant_shopify_id, product_shopify_id, product_title,
      product_handle, original_unit_price, discounted_unit_price, original_total, discounted_total,
      requires_shipping, taxable, is_gift_card, custom_attributes, payload
    )
    SELECT
      r.shopify_id, saved, entry ->> 'shopify_id', r.title, r.name, r.sku, r.vendor, r.variant_title,
      r.quantity, r.current_quantity, r.unfulfilled_quantity, r.variant_shopify_id,
      r.product_shopify_id, r.product_title, r.product_handle, r.original_unit_price,
      r.discounted_unit_price, r.original_total, r.discounted_total, r.requires_shipping, r.taxable,
      r.is_gift_card, r.custom_attributes, r.payload
    FROM jsonb_populate_recordset(NULL::shopify_order_line_items, items) r
    ON CONFLICT (shopify_id) DO UPDATE SET
      order_id = EXCLUDED.order_id,
      order_shopify_id = EXCLUDED.order_shopify_id,
      title = EXCLUDED.title,
      name = EXCLUDED.name,
      sku = EXCLUDED.sku,
      vendor = EXCLUDED.vendor,
      variant_title = EXCLUDED.variant_title,
      quantity = EXCLUDED.quantity,
      current_quantity = EXCLUDED.current_quantity,
      unfulfilled_quantity = EXCLUDED.unfulfilled_quantity,
      variant_shopify_id = EXCLUDED.variant_shopify_id,
      product_shopify_id = EXCLUDED.product_shopify_id,
      product_title = EXCLUDED.product_title,
      product_handle = EXCLUDED.product_handle,
      original_unit_price = EXCLUDED.original_unit_price,
      discounted_unit_price = EXCLUDED.discounted_unit_price,
      original_total = EXCLUDED.original_total,
      discounted_total = EXCLUDED.discounted_total,
      requires_shipping = EXCLUDED.requires_shipping,
      taxable = EXCLUDED.taxable,
      is_gift_card = EXCLUDED.is_gift_card,
      custom_attributes = EXCLUDED.custom_attributes,
      payload = EXCLUDED.payload;
  END LOOP;
  RETURN written;
END
$$;

REVOKE EXECUTE ON FUNCTION upsert_shopify_customers(JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION upsert_shopify_orders(JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION upsert_shopify_customers(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION upsert_shopify_orders(JSONB) TO service_role;

-- The admin refresh's own starting points (src/lib/portal/admin/refresh.ts). It used to start from
-- the newest stored shopify_updated_at, which one-off fetches move past changes it never read, so the
-- first run starts a week before that to pick up what it skipped. An empty copy starts from the
-- beginning.
INSERT INTO shopify_sync_state (resource, cursor)
SELECT 'orders_refresh', to_json(MAX(shopify_updated_at) - INTERVAL '7 days') #>> '{}'
FROM shopify_orders
ON CONFLICT (resource) DO NOTHING;

INSERT INTO shopify_sync_state (resource, cursor)
SELECT 'customers_refresh', to_json(MAX(shopify_updated_at) - INTERVAL '7 days') #>> '{}'
FROM shopify_customers
ON CONFLICT (resource) DO NOTHING;
