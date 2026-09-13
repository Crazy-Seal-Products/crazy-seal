-- Local copy of Shopify customers and orders for Pro Hub + staff admin.
-- Queryable columns cover filters/lists; payload jsonb keeps the full GraphQL node.
-- Service role writes via sync/webhooks. Staff (authenticated) may read.

CREATE TABLE IF NOT EXISTS shopify_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_id TEXT NOT NULL UNIQUE,
  legacy_resource_id TEXT,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  note TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  state TEXT,
  locale TEXT,
  tax_exempt BOOLEAN,
  verified_email BOOLEAN,
  number_of_orders INTEGER NOT NULL DEFAULT 0,
  amount_spent NUMERIC(14,2),
  amount_spent_currency TEXT,
  default_address JSONB,
  addresses JSONB NOT NULL DEFAULT '[]',
  email_marketing_state TEXT,
  sms_marketing_state TEXT,
  is_dealer BOOLEAN NOT NULL DEFAULT FALSE,
  is_commercial BOOLEAN NOT NULL DEFAULT FALSE,
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_shopify_customers_email_lower
  ON shopify_customers (lower(email));
CREATE INDEX IF NOT EXISTS idx_shopify_customers_phone
  ON shopify_customers (phone);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_tags
  ON shopify_customers USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_orders
  ON shopify_customers (number_of_orders DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_updated
  ON shopify_customers (shopify_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_customers_dealer
  ON shopify_customers (is_dealer) WHERE is_dealer AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_id TEXT NOT NULL UNIQUE,
  legacy_resource_id TEXT,
  name TEXT NOT NULL,
  number INTEGER,
  confirmation_number TEXT,
  email TEXT,
  phone TEXT,
  customer_shopify_id TEXT,
  customer_email TEXT,
  customer_display_name TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  return_status TEXT,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  closed_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  currency TEXT,
  presentment_currency TEXT,
  subtotal_price NUMERIC(14,2),
  total_price NUMERIC(14,2),
  total_tax NUMERIC(14,2),
  total_discounts NUMERIC(14,2),
  total_shipping NUMERIC(14,2),
  total_refunded NUMERIC(14,2),
  total_outstanding NUMERIC(14,2),
  current_total_price NUMERIC(14,2),
  tags TEXT[] NOT NULL DEFAULT '{}',
  note TEXT,
  source_name TEXT,
  po_number TEXT,
  test BOOLEAN NOT NULL DEFAULT FALSE,
  taxes_included BOOLEAN,
  tax_exempt BOOLEAN,
  fully_paid BOOLEAN,
  unpaid BOOLEAN,
  confirmed BOOLEAN,
  shipping_address JSONB,
  billing_address JSONB,
  shipping_lines JSONB NOT NULL DEFAULT '[]',
  fulfillments JSONB NOT NULL DEFAULT '[]',
  refunds JSONB NOT NULL DEFAULT '[]',
  transactions JSONB NOT NULL DEFAULT '[]',
  discount_codes TEXT[] NOT NULL DEFAULT '{}',
  discount_applications JSONB NOT NULL DEFAULT '[]',
  custom_attributes JSONB NOT NULL DEFAULT '[]',
  payment_gateway_names TEXT[] NOT NULL DEFAULT '{}',
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_shopify_orders_customer
  ON shopify_orders (customer_shopify_id);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_email_lower
  ON shopify_orders (lower(email));
CREATE INDEX IF NOT EXISTS idx_shopify_orders_name
  ON shopify_orders (name);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_created
  ON shopify_orders (shopify_created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_updated
  ON shopify_orders (shopify_updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_financial
  ON shopify_orders (financial_status);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_fulfillment
  ON shopify_orders (fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_shopify_orders_tags
  ON shopify_orders USING GIN (tags);

CREATE TABLE IF NOT EXISTS shopify_order_line_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_id TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES shopify_orders(id) ON DELETE CASCADE,
  order_shopify_id TEXT NOT NULL,
  title TEXT,
  name TEXT,
  sku TEXT,
  vendor TEXT,
  variant_title TEXT,
  quantity INTEGER,
  current_quantity INTEGER,
  unfulfilled_quantity INTEGER,
  variant_shopify_id TEXT,
  product_shopify_id TEXT,
  product_title TEXT,
  product_handle TEXT,
  original_unit_price NUMERIC(14,2),
  discounted_unit_price NUMERIC(14,2),
  original_total NUMERIC(14,2),
  discounted_total NUMERIC(14,2),
  requires_shipping BOOLEAN,
  taxable BOOLEAN,
  is_gift_card BOOLEAN,
  custom_attributes JSONB NOT NULL DEFAULT '[]',
  payload JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_shopify_line_items_order
  ON shopify_order_line_items (order_id);
CREATE INDEX IF NOT EXISTS idx_shopify_line_items_sku
  ON shopify_order_line_items (sku);
CREATE INDEX IF NOT EXISTS idx_shopify_line_items_product
  ON shopify_order_line_items (product_shopify_id);

CREATE TABLE IF NOT EXISTS shopify_sync_state (
  resource TEXT PRIMARY KEY,
  cursor TEXT,
  records_synced INTEGER NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_order_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read shopify customers" ON shopify_customers
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can read shopify orders" ON shopify_orders
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can read shopify order line items" ON shopify_order_line_items
  FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated can read shopify sync state" ON shopify_sync_state
  FOR SELECT TO authenticated USING (TRUE);
