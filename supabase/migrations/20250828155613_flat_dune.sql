/*
  # Fix infinite recursion in profiles RLS policies

  This migration completely removes all existing RLS policies on the profiles table
  and creates new, simple policies that don't cause infinite recursion.

  1. Security Changes
    - Drop all existing policies that may cause recursion
    - Create simple, direct policies using auth.uid()
    - Ensure admin access without circular dependencies

  2. New Policies
    - Users can read/update their own profile
    - Users can insert their own profile during registration
    - Admins get full access based on email check

  3. Prevention
    - No subqueries to profiles table in policy conditions
    - Direct auth.uid() comparisons only
    - Admin check uses auth.users table, not profiles
*/

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new, simple policies that don't cause recursion

-- Allow users to read their own profile
CREATE POLICY "users_can_read_own_profile" ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to insert their own profile during registration
CREATE POLICY "users_can_insert_own_profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_can_update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to have full access (using auth.users table to avoid recursion)
CREATE POLICY "admins_have_full_access" ON profiles
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

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;