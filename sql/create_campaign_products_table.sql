-- Create campaign_products table for assigning products to campaigns
CREATE TABLE IF NOT EXISTS campaign_products (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, product_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaign_products_campaign_id ON campaign_products(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_products_product_id ON campaign_products(product_id);

-- Enable RLS
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "campaign_products_select_all" ON campaign_products;
DROP POLICY IF EXISTS "campaign_products_insert_all" ON campaign_products;
DROP POLICY IF EXISTS "campaign_products_update_all" ON campaign_products;
DROP POLICY IF EXISTS "campaign_products_delete_all" ON campaign_products;

-- Create policies
CREATE POLICY "campaign_products_select_all" ON campaign_products
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "campaign_products_insert_all" ON campaign_products
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "campaign_products_update_all" ON campaign_products
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "campaign_products_delete_all" ON campaign_products
  FOR DELETE TO authenticated
  USING (true);
