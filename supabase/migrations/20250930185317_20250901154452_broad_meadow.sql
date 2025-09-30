/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Multiple conflicting RLS policies on profiles table
    - Some policies reference auth.uid() in ways that cause recursion
    - Policies that check profiles.role while querying profiles table

  2. Solution
    - Drop all existing problematic policies
    - Create clean, simple policies that avoid recursion
    - Use direct auth.uid() comparisons without subqueries

  3. Security
    - Users can read/update their own profile
    - Admins can manage all profiles (using auth metadata, not profile lookup)
    - Public users can insert profiles during registration
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Allow admins to manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "admins_all_access" ON profiles;
DROP POLICY IF EXISTS "admins_have_full_access" ON profiles;
DROP POLICY IF EXISTS "users_can_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON profiles;

-- Create clean, simple policies without recursion
CREATE POLICY "users_can_view_own_profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_can_insert_own_profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_can_update_own_profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin policy using auth metadata instead of profile lookup
CREATE POLICY "admin_full_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'email') = 'admin@bwitty.com'
  )
  WITH CHECK (
    (auth.jwt() ->> 'email') = 'admin@bwitty.com'
  );

-- Allow public insert for registration (needed for sign-up process)
CREATE POLICY "allow_registration_insert"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);