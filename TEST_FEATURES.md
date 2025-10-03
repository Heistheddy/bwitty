# Testing Instructions

After applying the database migration, follow these steps to test each feature:

## Prerequisites
1. Apply the database migration (see SETUP_DATABASE.md)
2. Make sure you have at least one product in the database
3. Create a test user account or log in with existing credentials

## Test 1: Product Reviews

### Steps:
1. Navigate to any product details page (e.g., `/product/{product-id}`)
2. Scroll down to the "Customer Reviews" section
3. Click "Write Review" button (must be logged in)
4. Select a star rating (1-5 stars)
5. Enter a comment (optional)
6. Click "Submit Review"

### Expected Results:
- ✅ Review form appears when "Write Review" is clicked
- ✅ Star rating can be selected
- ✅ Review is saved and appears in the reviews list
- ✅ Average rating updates at the top of the page
- ✅ Review count increases
- ✅ Success toast notification appears
- ✅ Can edit review by clicking "Edit Review"
- ✅ Review persists after page reload

### Common Issues:
- **Error: "relation product_reviews does not exist"**
  → The migration hasn't been applied. Run the SQL script in Supabase dashboard.

- **Error: "new row violates row-level security policy"**
  → User is not authenticated or auth.uid() is not set correctly.

- **Review not appearing**
  → Check browser console for errors. Verify RLS policies are applied.

## Test 2: Favorites

### Steps:
1. Navigate to any product details page
2. Look for the heart icon button next to "Add to Cart"
3. Click the heart icon (must be logged in)

### Expected Results:
- ✅ Heart icon fills with color when clicked
- ✅ Toast notification shows "Added to Favorites"
- ✅ Click again to remove from favorites
- ✅ Toast notification shows "Removed from Favorites"
- ✅ Favorite status persists after page reload
- ✅ Heart icon state matches favorite status on page load

### Common Issues:
- **Error: "relation user_favorites does not exist"**
  → The migration hasn't been applied. Run the SQL script in Supabase dashboard.

- **Error: "Login Required" toast**
  → User is not logged in. Create account or log in first.

- **Heart icon not updating**
  → Check browser console for errors. Clear cache and reload.

## Test 3: Shipping Addresses

### Steps:
1. Log in to your account
2. Navigate to Account page (`/account`)
3. Click on "Shipping" tab
4. Click "Add Address" button
5. Fill in the form:
   - Full Name (required)
   - Phone (required)
   - Address Line 1 (required)
   - Address Line 2 (optional)
   - City (required)
   - State (required)
   - Postal Code (optional)
   - Country (defaults to Nigeria)
6. Check "Set as default address" if desired
7. Click "Save Address"

### Expected Results:
- ✅ Address form appears when "Add Address" is clicked
- ✅ Form validates required fields
- ✅ Address is saved and appears in the list
- ✅ Default address shows a "Default" badge
- ✅ Only one address can be default at a time
- ✅ Can edit address by clicking edit icon
- ✅ Can delete address by clicking trash icon
- ✅ Can set any address as default by clicking "Set Default"
- ✅ Success toast notifications for all actions
- ✅ Addresses persist after page reload

### Common Issues:
- **Error: "relation shipping_addresses does not exist"**
  → The migration hasn't been applied. Run the SQL script in Supabase dashboard.

- **Form not submitting**
  → Check that all required fields are filled.
  → Check browser console for validation errors.

- **Multiple default addresses**
  → This should not happen. The database trigger enforces single default.
  → If it occurs, drop and recreate the trigger.

## Test 4: Password Change

### Steps:
1. Log in to your account
2. Navigate to Account page (`/account`)
3. Click "Change Password" link
4. Enter current password (not verified, but required)
5. Enter new password (min 6 characters)
6. Confirm new password
7. Click "Update Password"

### Expected Results:
- ✅ Password change form appears
- ✅ Form validates password length (min 6 chars)
- ✅ Form validates passwords match
- ✅ Success message appears
- ✅ Redirected back to account page
- ✅ Can log in with new password

### Common Issues:
- **Error: "Failed to update password"**
  → Supabase auth service issue. Check error in console.

- **Still able to use old password**
  → Clear browser cache and cookies.
  → Log out and log in again.

## Debugging Tips

### Check Browser Console
Open browser DevTools (F12) and check Console tab for errors:
```javascript
// Common error messages:
"relation [table_name] does not exist" → Migration not applied
"new row violates row-level security" → RLS policy issue
"null value in column violates not-null" → Missing required field
```

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform the action (e.g., submit review)
5. Look for failed requests (red)
6. Click on failed request to see error details

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Logs → Postgres Logs
3. Filter for errors around the time you tested
4. Look for constraint violations or RLS policy errors

### Test RLS Policies Manually

Run these queries in SQL Editor to test RLS:

```sql
-- Test as authenticated user
-- Replace 'your-user-id' with actual user UUID
SET request.jwt.claims.sub = 'your-user-id';

-- Try to insert a review
INSERT INTO product_reviews (product_id, user_id, rating, comment)
VALUES ('product-uuid', 'your-user-id', 5, 'Test review');

-- Try to select reviews
SELECT * FROM product_reviews WHERE user_id = 'your-user-id';
```

## Need Help?

If features still aren't working after following these steps:

1. Verify migration was applied successfully (check SETUP_DATABASE.md)
2. Check browser console for JavaScript errors
3. Check Supabase dashboard logs for database errors
4. Verify user is authenticated (check auth state in browser DevTools)
5. Try with a fresh user account
6. Clear all browser cache and localStorage

## Quick Verification Queries

Run these in Supabase SQL Editor to verify everything is set up:

```sql
-- Check if tables exist
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'product_reviews'
) as reviews_exists,
EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'user_favorites'
) as favorites_exists,
EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'shipping_addresses'
) as addresses_exists;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('product_reviews', 'user_favorites', 'shipping_addresses');

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('product_reviews', 'user_favorites', 'shipping_addresses')
GROUP BY tablename;
```

Expected results:
- All `*_exists` columns should be `true`
- All `rowsecurity` should be `true`
- product_reviews: 4 policies
- user_favorites: 3 policies
- shipping_addresses: 4 policies
