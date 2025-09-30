/*
  # Fix profiles table RLS policy for user registration

  1. Security Changes
    - Drop existing restrictive INSERT policy that's blocking user registration
    - Add new INSERT policy that allows authenticated users to create their own profile
    - Ensure users can only insert profiles where the id matches their auth.uid()

  2. Policy Details
    - Policy name: "Users can insert own profile" 
    - Allows INSERT operations for authenticated users
    - Uses WITH CHECK to ensure id matches auth.uid()
*/

-- Drop the existing restrictive INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that allows authenticated users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the policy is properly applied by refreshing the table's RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;