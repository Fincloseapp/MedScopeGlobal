-- v27.2 subscription plan metadata on orders
ALTER TABLE v27_orders
  ADD COLUMN IF NOT EXISTS billing_interval TEXT DEFAULT 'month';

CREATE INDEX IF NOT EXISTS idx_v27_orders_product ON v27_orders(product_id);

COMMENT ON COLUMN v27_orders.billing_interval IS 'month or year for subscription checkout';
