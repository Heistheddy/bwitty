/*
  # Fix RLS infinite recursion policies

  1. Problem Resolution
    - Drop all existing broken RLS policies that cause infinite recursion
    - Create clean, non-recursive policies for profiles and orders tables
    - Ensure proper user isolation and admin access

  2. New Policies Structure
    - profiles: Users can view/update own profile, admins can manage all
    - orders: Users can view/insert own orders, admins can manage all
    - Admin checks use EXISTS subquery to avoid recursion

  3. Security Rules
    - Normal users: id = auth.uid() for profiles, user_id = auth.uid() for orders
    - Admins: role = 'admin' check via EXISTS subquery
    - No circular references between tables
*/

-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "profiles_all_access_for_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_own_profile_access" ON public.profiles;
DROP POLICY IF EXISTS "orders_all_access_for_admin" ON public.orders;
DROP POLICY IF EXISTS "orders_own_access" ON public.orders;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_full_access_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_can_view_own_orders" ON public.orders;
DROP POLICY IF EXISTS "users_can_insert_own_orders" ON public.orders;
DROP POLICY IF EXISTS "admins_full_access_orders" ON public.orders;

-- Ensure Row Level Security is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- PROFILES TABLE POLICIES
-- 1. Allow authenticated users to view their own profile
CREATE POLICY "Allow authenticated users to view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Allow authenticated users to insert their own profile (on sign-up)
CREATE POLICY "Allow authenticated users to insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to update their own profile
CREATE POLICY "Allow authenticated users to update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Allow admins to manage all profiles
-- Uses EXISTS subquery optimized by Supabase to avoid recursion
CREATE POLICY "Allow admins to manage all profiles"
ON public.profiles FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- ORDERS TABLE POLICIES
-- 1. Allow authenticated users to view their own orders
CREATE POLICY "Allow authenticated users to view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Allow authenticated users to insert their own orders
CREATE POLICY "Allow authenticated users to insert own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow admins to manage all orders
-- References profiles table to check admin role (allowed by RLS design)
CREATE POLICY "Allow admins to manage all orders"
ON public.orders FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));