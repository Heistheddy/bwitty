/*
  # Add Reviews, Favorites, and Shipping Address Tables

  1. New Tables
    - `product_reviews`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_favorites`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)

    - `shipping_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `address_line1` (text)
      - `address_line2` (text)
      - `city` (text)
      - `state` (text)
      - `postal_code` (text)
      - `country` (text, default 'Nigeria')
      - `is_default` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Profile Updates
    - Add `notification_email` column to profiles table

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to reviews
*/

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

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
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

-- Add notification_email to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notification_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_email text;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Product Reviews Policies
CREATE POLICY "Anyone can view reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Favorites Policies
CREATE POLICY "Users can view own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Shipping Addresses Policies
CREATE POLICY "Users can view own addresses"
  ON shipping_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses"
  ON shipping_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON shipping_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON shipping_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default) WHERE is_default = true;
