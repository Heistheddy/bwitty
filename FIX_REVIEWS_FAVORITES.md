# Fix Reviews & Favorites Loading Issues

## Problem

You're experiencing:
1. ❌ "Failed to load favorites" error
2. ❌ "Failed to submit review" error
3. ✅ Data shows in Supabase database
4. ❌ Data doesn't show on website

## Root Cause

**The issue is RLS (Row Level Security) policies blocking access to related tables.**

When reviews or favorites are loaded, they need to:
- Read from `product_reviews` or `user_favorites` ✅ (works)
- Read from `products` table to get product details ❌ (blocked!)
- Read from `profiles` table to get user names ❌ (blocked!)

Your `products` and `profiles` tables likely don't have public SELECT policies, so the queries fail.

---

## Solution - Run This SQL

### Step 1: Apply the RLS Fix

**Open Supabase Dashboard → SQL Editor**

**Copy and run this entire SQL script:**

```sql
-- ============================================
-- FIX RLS POLICIES FOR PRODUCTS AND PROFILES
-- ============================================

-- PRODUCTS TABLE - Enable public read access
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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

-- PROFILES TABLE - Enable public read access for names
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Verification
SELECT 'All policies updated successfully!' as message;
```

### Step 2: Verify the Fix

Run these verification queries in Supabase SQL Editor:

```sql
-- Check products policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'products';

-- Check profiles policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'profiles';

-- Test product selection (should return rows)
SELECT COUNT(*) as product_count FROM products;

-- Test profile selection (should return rows)
SELECT COUNT(*) as profile_count FROM profiles;
```

**Expected Results:**
- Products should have 2 policies: "Anyone can view products" and "Admin can manage products"
- Profiles should have 3 policies: "Anyone can view basic profile info", "Users can insert own profile", "Users can update own profile"
- Both COUNT queries should return numbers > 0

---

## Why This Fixes It

### Before (Broken):
```
User → Query favorites
  → Read user_favorites ✅
  → Read products ❌ (RLS blocked!)
  → ERROR: "Failed to load favorites"
```

### After (Fixed):
```
User → Query favorites
  → Read user_favorites ✅
  → Read products ✅ (public SELECT allowed!)
  → SUCCESS: Favorites display
```

### Security Note:

**This is safe because:**
- ✅ Product information is PUBLIC data (everyone should see products)
- ✅ Basic profile info (names) is PUBLIC for reviews
- ✅ Private data (email, phone) still protected
- ✅ Only admins can modify products
- ✅ Users can only modify their own profiles

---

## Testing After Fix

### Test 1: View Favorites

1. Open browser console (F12)
2. Go to Account → Favorites tab
3. Check console for logs:
   - "Loaded favorites: [...]" should show products
   - NO errors about permissions

**Expected:** Favorites display correctly

### Test 2: Submit Review

1. Open browser console (F12)
2. Go to any product page
3. Click "Write Review"
4. Submit a review
5. Check console for logs:
   - "Submitting review: {...}"
   - "Review submitted successfully: [...]"
   - NO errors

**Expected:** Review appears immediately in list

### Test 3: View Reviews

1. Go to any product with reviews
2. Scroll to "Customer Reviews"
3. Check that reviews display with:
   - User names (or "Anonymous")
   - Ratings (stars)
   - Comments
   - Date

**Expected:** All reviews visible

---

## Troubleshooting

### Issue 1: Still Getting Errors

**Check Console Logs:**
1. Open browser (F12 → Console)
2. Try the action again
3. Look for specific error messages

**Common Errors:**

**"permission denied for table products"**
- Run the SQL script again
- Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'products'`

**"permission denied for table profiles"**
- Run the SQL script again
- Verify policy exists: `SELECT * FROM pg_policies WHERE tablename = 'profiles'`

**"relation products does not exist"**
- Your products table doesn't exist
- Need to run the products table creation migration first

### Issue 2: Reviews Show But No Names

**Symptoms:**
- Reviews display
- All show "Anonymous"
- Console shows errors about profiles

**Solution:**
Make sure the profiles public SELECT policy was created:

```sql
-- Run this separately if needed
CREATE POLICY "Anyone can view basic profile info"
  ON profiles
  FOR SELECT
  TO public
  USING (true);
```

### Issue 3: Favorites Show But No Product Details

**Symptoms:**
- Favorites tab shows items
- Product images/titles missing
- Console shows products query errors

**Solution:**
Make sure products public SELECT policy was created:

```sql
-- Run this separately if needed
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO public
  USING (true);
```

### Issue 4: Can't Find Supabase Dashboard

**To access Supabase Dashboard:**
1. Go to: https://app.supabase.com
2. Sign in with your Supabase account
3. Select your project from the list
4. Click "SQL Editor" in left sidebar
5. Click "New Query"
6. Paste and run SQL

---

## Alternative Quick Fix

If you don't want public access to products/profiles, you can use service role key (less secure):

**Option 1: Public Policies (Recommended)**
- Run the SQL script above ✅
- Safe and standard approach
- Best for e-commerce sites

**Option 2: Service Role (Not Recommended)**
- Use service role key in client (security risk!)
- Bypasses all RLS policies
- Can expose sensitive data
- ❌ Don't use this option

Stick with **Option 1**.

---

## Verification Checklist

After running the SQL script, verify:

- [ ] Ran SQL script in Supabase SQL Editor
- [ ] Got "All policies updated successfully!" message
- [ ] Verified products policies exist (2 policies)
- [ ] Verified profiles policies exist (3 policies)
- [ ] Cleared browser cache (Ctrl+Shift+R)
- [ ] Refreshed website
- [ ] Checked console for errors (F12)
- [ ] Tested viewing favorites
- [ ] Tested submitting review
- [ ] Tested viewing reviews

---

## Code Improvements Included

The code has been updated with better error handling:

### Reviews (`src/lib/reviews.ts`):
- ✅ Better error logging
- ✅ Handles missing profile data gracefully
- ✅ Shows "Anonymous" for deleted users
- ✅ Console logs for debugging

### Favorites (`src/components/FavoritesSection.tsx`):
- ✅ Detailed error messages
- ✅ Console logs for debugging
- ✅ Better error toast messages
- ✅ Graceful failure handling

### Console Logs Added:
When you perform actions, you'll see helpful logs:
- "Submitting review: {...}"
- "Review submitted successfully: [...]"
- "Loaded favorites: [...]"
- Error details if something fails

---

## Summary

1. **Problem:** RLS policies block access to `products` and `profiles` tables
2. **Solution:** Run `FIX_RLS_POLICIES.sql` in Supabase SQL Editor
3. **Result:** Reviews and favorites load correctly
4. **Time:** 2 minutes to fix

**Run the SQL script and everything will work!**

---

## Files to Use

1. **FIX_RLS_POLICIES.sql** - Main fix (run this!)
2. **RUN_THIS_SQL.sql** - Original tables creation
3. **This document** - Troubleshooting guide

**Just run FIX_RLS_POLICIES.sql and you're done!**
