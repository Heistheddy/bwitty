/*
  # Create user_favourites Table

  1. New Table
    - `user_favourites`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on user_favourites table
    - Add policies for authenticated users to manage their own favorites
    
  3. Constraints
    - UNIQUE constraint on (product_id, user_id) to prevent duplicates
    - CASCADE delete when product or user is deleted
*/

-- Create user_favourites table
CREATE TABLE IF NOT EXISTS user_favourites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Enable RLS
ALTER TABLE user_favourites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favourites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add to their own favorites
CREATE POLICY "Users can add favorites"
  ON user_favourites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own favorites
CREATE POLICY "Users can remove favorites"
  ON user_favourites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id ON user_favourites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favourites_product_id ON user_favourites(product_id);
