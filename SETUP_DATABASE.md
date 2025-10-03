# Database Setup Instructions

The application is currently failing for reviews, favorites, and shipping addresses because the database tables haven't been created yet.

## What You Need to Do

You need to run the SQL migration in your Supabase database to create the required tables.

## Step-by-Step Instructions

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire SQL script from `supabase/migrations/20251003_add_reviews_favorites_shipping.sql`
6. Click "Run" to execute the migration

### Option 2: Using Supabase CLI (If Installed)

If you have the Supabase CLI installed locally:

```bash
# Navigate to project directory
cd /path/to/your/project

# Run the migration
supabase db push
```

## What This Migration Creates

The migration creates three new tables:

### 1. product_reviews
- Stores product reviews from users
- Includes rating (1-5 stars) and comment
- One review per user per product (enforced by unique constraint)

### 2. user_favorites
- Stores user's favorite products
- Simple many-to-many relationship between users and products
- One favorite entry per user per product

### 3. shipping_addresses
- Stores multiple shipping addresses per user
- Supports default address (only one per user)
- Includes full address details (name, phone, address, city, state, etc.)

### 4. Profile Updates
- Adds `notification_email` column to existing `profiles` table

## Security (Row Level Security)

All tables have RLS policies configured:

- **Reviews**: Anyone can read, authenticated users can create/edit/delete their own
- **Favorites**: Authenticated users can only view/manage their own favorites
- **Shipping Addresses**: Authenticated users can only view/manage their own addresses

## After Running the Migration

Once the migration is applied successfully:

1. Clear your browser cache and reload the application
2. Log in as a user
3. Try the following features:
   - Navigate to a product page and write a review
   - Click the heart icon to add a product to favorites
   - Go to Account → Shipping tab to add a shipping address

## Troubleshooting

If you get errors about existing tables:
- The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times
- If you need to reset, you can drop the tables first:
  ```sql
  DROP TABLE IF EXISTS product_reviews CASCADE;
  DROP TABLE IF EXISTS user_favorites CASCADE;
  DROP TABLE IF EXISTS shipping_addresses CASCADE;
  ```
  Then run the migration again.

If you get RLS policy errors:
- Make sure you're logged in as an authenticated user
- Check that the user's auth.uid() matches the user_id in the database

## Verification

To verify the tables were created successfully, run this query in SQL Editor:

```sql
-- Check if all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('product_reviews', 'user_favorites', 'shipping_addresses')
ORDER BY table_name;
```

You should see all three table names returned.

To verify RLS policies:

```sql
-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('product_reviews', 'user_favorites', 'shipping_addresses')
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.
