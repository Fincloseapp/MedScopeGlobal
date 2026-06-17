-- v27 monetization: orders table for checkout tracking
CREATE TABLE IF NOT EXISTS v27_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  kind TEXT NOT NULL,
  product_id TEXT NOT NULL,
  amount_czk INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v27_orders_status ON v27_orders(status);
CREATE INDEX IF NOT EXISTS idx_v27_orders_user ON v27_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_v27_orders_created ON v27_orders(created_at DESC);

ALTER TABLE v27_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access v27_orders" ON v27_orders;
CREATE POLICY "Service role full access v27_orders"
  ON v27_orders FOR ALL
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE v27_orders IS 'MedScope v27 checkout orders — mini-products, subscriptions, PDFs, B2B';
