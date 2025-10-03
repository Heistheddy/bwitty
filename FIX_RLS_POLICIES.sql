-- ============================================
-- FIX RLS POLICIES FOR PRODUCTS AND PROFILES
-- ============================================
-- Run this in Supabase SQL Editor to fix the issue where
-- reviews and favorites can't load product data

-- ============================================
-- PRODUCTS TABLE - Enable public read access
-- ============================================

-- Enable RLS on products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;

-- Allow everyone to view products
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users with admin role to manage products
CREATE POLICY "Admin can manage products"
  ON products
  FOR ALL
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

-- ============================================
-- PROFILES TABLE - Enable public read access for names
-- ============================================

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view basic profile info" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Allow everyone to view basic profile info (for reviews)
CREATE POLICY "Anyone can view basic profile info"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check products policies
SELECT 'Products Policies:' as info;
SELECT policyname, cmd, roles, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'products';

-- Check profiles policies
SELECT 'Profiles Policies:' as info;
SELECT policyname, cmd, roles, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'profiles';

-- Test product selection (should return rows)
SELECT 'Testing product selection:' as info;
SELECT COUNT(*) as product_count FROM products;

-- Test profile selection (should return rows)
SELECT 'Testing profile selection:' as info;
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'All policies updated successfully!' as message;
