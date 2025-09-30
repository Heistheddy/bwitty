/*
  # Insert initial products from hardcoded data

  1. Products
    - Insert all existing products from the application
    - Map existing product structure to new database schema
    - Use placeholder images from Pexels (existing URLs)
    - Set appropriate categories and stock levels

  2. Data Migration
    - Convert price from number to numeric(10,2)
    - Map title to name
    - Set reasonable stock levels
    - Preserve existing categories and descriptions
*/

-- Insert initial products
INSERT INTO products (name, description, price, category, stock, image_url) VALUES
-- Hair Products
('Premium Brazilian Deep Wave Wig', 'Luxurious 100% human hair deep wave wig with natural hairline. Perfect for special occasions or everyday wear.', 45000.00, 'hair-products', 15, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'),
('Curly Hair Extensions Bundle', 'High-quality curly hair extensions, 16-20 inches. Soft, tangle-free, and blends seamlessly with natural hair.', 28000.00, 'hair-products', 25, 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg'),
('HD Lace Frontal Closure', 'Invisible HD lace frontal closure for natural hairline. Easy to install and style.', 18000.00, 'hair-products', 20, 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg'),
('Straight Human Hair Wig', 'Sleek straight human hair wig with natural density. Professional quality with adjustable cap.', 38000.00, 'hair-products', 12, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg'),

-- Clothing
('African Print Maxi Dress', 'Beautiful traditional African print maxi dress. Perfect for cultural events and special occasions.', 15000.00, 'clothing', 30, 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),
('Designer Ankara Blouse', 'Stylish Ankara print blouse with modern cut. Versatile piece for office or casual wear.', 8500.00, 'clothing', 40, 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg'),

-- Gadgets & Electronics
('Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life. Crystal clear sound quality.', 12000.00, 'gadgets', 50, 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'),
('Fast Charging Power Bank', '20000mAh portable power bank with fast charging technology. Multiple USB ports for simultaneous charging.', 7500.00, 'gadgets', 75, 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'),
('Smart Phone Stand', 'Adjustable smartphone stand with wireless charging capability. Perfect for video calls and content viewing.', 4500.00, 'gadgets', 100, 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'),

-- Household Items
('Premium Kitchen Knife Set', 'Professional-grade stainless steel knife set with wooden block. Essential for every kitchen.', 18000.00, 'household', 20, 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg'),
('Luxury Bedding Set', 'Soft cotton bedding set with elegant design. Includes duvet cover, pillowcases, and fitted sheet.', 25000.00, 'household', 15, 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg'),
('Decorative Table Lamp', 'Modern decorative table lamp with warm LED lighting. Perfect accent piece for any room.', 9500.00, 'household', 35, 'https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg')

ON CONFLICT (id) DO NOTHING;