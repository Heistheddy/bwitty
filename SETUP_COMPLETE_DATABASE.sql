-- ============================================
-- COMPLETE DATABASE SETUP FOR BWITTY NG LTD
-- RUN THIS IN SUPABASE SQL EDITOR
-- ============================================
-- This script creates all necessary tables, RLS policies, and relationships
-- Safe to run multiple times (uses IF NOT EXISTS and DROP IF EXISTS)
-- ============================================

-- ============================================
-- 1. CREATE CORE TABLES
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  notification_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  stock integer DEFAULT 0 CHECK (stock >= 0),
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table (for multiple images per product)
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_address jsonb,
  payment_reference text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create messages table (admin-user messaging)
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  response text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Drop old user_favorites table if it exists (wrong spelling)
DROP TABLE IF EXISTS user_favorites CASCADE;

-- Create user_favourites table (correct spelling)
CREATE TABLE IF NOT EXISTS user_favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Create shipping_addresses table
CREATE TABLE IF NOT EXISTS shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  state text NOT NULL,
  postal_code text,
  country text DEFAULT 'Nigeria' NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. CREATE FUNCTIONS
-- ============================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE shipping_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. CREATE TRIGGERS
-- ============================================

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
DROP TRIGGER IF EXISTS update_shipping_addresses_updated_at ON shipping_addresses;
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON shipping_addresses;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. DROP ALL EXISTING POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Products policies
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Product images policies
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

-- Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can create messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
DROP POLICY IF EXISTS "Admins can respond to messages" ON messages;

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON product_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON product_reviews;

-- Favourites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favourites;
DROP POLICY IF EXISTS "Users can add favorites" ON user_favourites;
DROP POLICY IF EXISTS "Users can remove favorites" ON user_favourites;

-- Shipping addresses policies
DROP POLICY IF EXISTS "Users can view own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can create own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON shipping_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON shipping_addresses;

-- ============================================
-- 6. CREATE RLS POLICIES
-- ============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- PRODUCTS POLICIES
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- PRODUCT IMAGES POLICIES
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ORDERS POLICIES
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ORDER ITEMS POLICIES
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- MESSAGES POLICIES
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can respond to messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- PRODUCT REVIEWS POLICIES
CREATE POLICY "Anyone can view reviews"
  ON product_reviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- USER FAVOURITES POLICIES
CREATE POLICY "Users can view own favorites"
  ON user_favourites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON user_favourites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON user_favourites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- SHIPPING ADDRESSES POLICIES
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses"
  ON shipping_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON shipping_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 7. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id ON user_favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favourites_product_id ON user_favourites(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default) WHERE is_default = true;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

SELECT 'Database setup completed successfully!' as message,
       'All tables, RLS policies, triggers, and indexes have been created.' as details;
