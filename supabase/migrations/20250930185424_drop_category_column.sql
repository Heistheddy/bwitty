/*
  # Drop category column from products table

  1. Schema Change
    - Remove category column from products table
    - This field is no longer needed as categories are managed differently

  2. Data Safety
    - Uses IF EXISTS to prevent errors if column already dropped
    - Non-destructive migration that only removes schema, not data relationships
*/

ALTER TABLE products DROP COLUMN IF EXISTS category;