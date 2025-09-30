/*
  # Create automatic profile creation trigger

  1. Trigger Function
    - `handle_new_user()` function that creates a profile when a new user signs up
    - Uses user metadata to populate profile fields
    - Sets default role as 'user'
    - Handles admin email special case

  2. Trigger
    - Fires after INSERT on `auth.users`
    - Automatically creates corresponding profile record
    - Uses user's auth.uid as profile.id

  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profiles, doesn't modify existing ones
*/

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.email = 'admin@bwitty.com' THEN 'admin'
      ELSE 'user'
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;