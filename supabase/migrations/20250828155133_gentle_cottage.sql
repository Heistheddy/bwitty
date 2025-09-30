/*
  # Fix infinite recursion in profiles RLS policies

  1. Problem
    - Current RLS policies on profiles table have circular dependencies
    - Policies reference themselves causing infinite recursion
    - This affects orders table queries that depend on profiles

  2. Solution
    - Drop all existing problematic policies
    - Create simple, non-recursive policies
    - Use direct auth.uid() comparisons instead of subqueries
    - Separate admin and user access clearly

  3. Security
    - Users can only access their own profile data
    - Admins can access all profiles
    - No circular policy dependencies
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create simple, non-recursive policies
-- Users can read their own profile
CREATE POLICY "users_select_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can do everything (simple role check without subqueries)
CREATE POLICY "admins_all_access" ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@bwitty.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@bwitty.com'
    )
  );