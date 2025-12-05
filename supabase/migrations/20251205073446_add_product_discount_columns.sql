/*
  # Add product discount columns
  
  1. Changes
    - Add `discount_percentage` column to products table (integer, default 0, range 0-90)
    - Add `sale_price` column to products table (numeric, nullable)
    - Add check constraint to ensure discount_percentage is between 0 and 90
    - Add check constraint to ensure sale_price is non-negative if set
  
  2. Purpose
    - Enable sales and discount functionality for products
    - sale_price is automatically calculated: price - (price * discount_percentage / 100)
    - When discount_percentage is 0, sale_price is null (no discount)
*/

DO $$
BEGIN
  -- Add discount_percentage column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN discount_percentage integer DEFAULT 0 
    CHECK (discount_percentage >= 0 AND discount_percentage <= 90);
  END IF;
  
  -- Add sale_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sale_price'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN sale_price numeric 
    CHECK (sale_price >= 0 OR sale_price IS NULL);
  END IF;
END $$;