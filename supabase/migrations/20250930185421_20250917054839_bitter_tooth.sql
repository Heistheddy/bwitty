/*
  # Migrate existing product images to product_images table

  1. Data Migration
    - Move existing image_url data from products table to product_images table
    - Create proper relationships between products and their images
    - Clean up old image_url column from products table

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during migration
*/

-- First, migrate existing image URLs to product_images table
INSERT INTO product_images (product_id, image_url)
SELECT id, image_url 
FROM products 
WHERE image_url IS NOT NULL AND image_url != '';

-- Remove the image_url column from products table since we now use product_images
ALTER TABLE products DROP COLUMN IF EXISTS image_url;