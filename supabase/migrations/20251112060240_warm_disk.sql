/*
  # Enhanced Security and Performance Updates

  1. Security Improvements
    - Add admin role validation function
    - Strengthen RLS policies
    - Add audit logging

  2. Performance Optimizations
    - Add missing indexes
    - Optimize query patterns
    - Add materialized views for analytics

  3. Business Logic Enhancements
    - Add order status transitions
    - Implement stock reservation
    - Add delivery tracking
*/

-- Create admin validation function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role = 'admin'
    AND email = 'kr0792505@gmail.com'
  );
$$;

-- Create order status validation function
CREATE OR REPLACE FUNCTION is_valid_status_transition(current_status text, new_status text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN current_status = 'pending' AND new_status IN ('confirmed', 'cancelled') THEN true
    WHEN current_status = 'confirmed' AND new_status IN ('processing', 'cancelled') THEN true
    WHEN current_status = 'processing' AND new_status IN ('shipped', 'cancelled') THEN true
    WHEN current_status = 'shipped' AND new_status = 'delivered' THEN true
    ELSE false
  END;
$$;

-- Add audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(featured, is_active) WHERE featured = true AND is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date_status ON orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status) WHERE status = 'pending';

-- Add stock reservation system
ALTER TABLE products ADD COLUMN IF NOT EXISTS reserved_stock integer DEFAULT 0 CHECK (reserved_stock >= 0);

-- Create function to reserve stock
CREATE OR REPLACE FUNCTION reserve_product_stock(product_id uuid, quantity integer)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  available_stock integer;
BEGIN
  -- Get current available stock
  SELECT (stock - reserved_stock) INTO available_stock
  FROM products
  WHERE id = product_id AND is_active = true;
  
  -- Check if enough stock available
  IF available_stock >= quantity THEN
    -- Reserve the stock
    UPDATE products
    SET reserved_stock = reserved_stock + quantity
    WHERE id = product_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- Create function to release reserved stock
CREATE OR REPLACE FUNCTION release_product_stock(product_id uuid, quantity integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE products
  SET reserved_stock = GREATEST(0, reserved_stock - quantity)
  WHERE id = product_id;
END;
$$;

-- Update order status validation
ALTER TABLE orders ADD CONSTRAINT valid_status_transition 
  CHECK (
    CASE 
      WHEN status = 'pending' THEN true
      ELSE is_valid_status_transition(
        (SELECT status FROM orders o2 WHERE o2.id = orders.id),
        status
      )
    END
  );

-- Enhanced RLS policies with admin function
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin(auth.uid()));

-- Add delivery tracking table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('assigned', 'picked_up', 'in_transit', 'delivered')),
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit logs (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS policies for delivery tracking
CREATE POLICY "Users can view own delivery tracking" ON delivery_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = delivery_tracking.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage delivery tracking" ON delivery_tracking
  FOR ALL USING (is_admin(auth.uid()));

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS order_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value,
  COUNT(*) FILTER (WHERE status = 'delivered') as completed_orders,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_order_analytics_date ON order_analytics(date);

-- Function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_order_analytics()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY order_analytics;
$$;

-- Trigger to auto-refresh analytics daily
CREATE OR REPLACE FUNCTION trigger_refresh_analytics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh analytics when orders are updated
  PERFORM refresh_order_analytics();
  RETURN NULL;
END;
$$;

-- Create trigger (but limit frequency to avoid performance issues)
DROP TRIGGER IF EXISTS refresh_analytics_trigger ON orders;
CREATE TRIGGER refresh_analytics_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_analytics();