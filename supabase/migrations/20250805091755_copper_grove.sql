/*
  # Seed Initial Data for KR Stores

  1. Categories
    - Vegetables, Fruits, Spices, Groceries

  2. Products
    - Sample products for each category with realistic pricing

  3. Delivery Areas
    - Mumbai area coverage with distance-based pricing

  4. Admin User
    - Create admin profile for kr0792505@gmail.com
*/

-- Insert Categories
INSERT INTO categories (name, slug, description, icon) VALUES
('Vegetables', 'vegetables', 'Fresh organic vegetables delivered daily', '🥦'),
('Fruits', 'fruits', 'Sweet and juicy seasonal fruits', '🍎'),
('Spices', 'spices', 'Aromatic spices and seasonings', '🌶️'),
('Groceries', 'groceries', 'Daily essentials and staples', '🍚')
ON CONFLICT (slug) DO NOTHING;

-- Insert Delivery Areas (Mumbai regions)
INSERT INTO delivery_areas (name, pincode, distance_km, delivery_fee) VALUES
('Andheri', '400053', 5.2, 26.00),
('Bandra', '400050', 8.1, 41.00),
('Borivali', '400092', 12.3, 62.00),
('Colaba', '400001', 15.7, 79.00),
('Dadar', '400014', 6.8, 34.00),
('Ghatkopar', '400077', 18.2, 91.00),
('Juhu', '400049', 9.4, 47.00),
('Kandivali', '400067', 14.1, 71.00),
('Malad', '400064', 16.8, 84.00),
('Powai', '400076', 11.7, 59.00),
('Santa Cruz', '400054', 7.3, 37.00),
('Thane', '400601', 22.5, 100.00),
('Vashi', '400703', 19.8, 99.00),
('Worli', '400018', 4.6, 23.00)
ON CONFLICT DO NOTHING;

-- Insert Products
WITH category_ids AS (
  SELECT 
    (SELECT id FROM categories WHERE slug = 'vegetables') as vegetables_id,
    (SELECT id FROM categories WHERE slug = 'fruits') as fruits_id,
    (SELECT id FROM categories WHERE slug = 'spices') as spices_id,
    (SELECT id FROM categories WHERE slug = 'groceries') as groceries_id
)
INSERT INTO products (name, slug, description, category_id, price, original_price, unit, stock, image_url, featured) 
SELECT * FROM (
  VALUES
  -- Vegetables
  ('Fresh Tomatoes', 'fresh-tomatoes', 'Farm-fresh red tomatoes, perfect for cooking and salads. Rich in vitamins and antioxidants.', (SELECT vegetables_id FROM category_ids), 40.00, 50.00, 'kg', 50, 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Organic Spinach', 'organic-spinach', 'Fresh organic spinach leaves, packed with iron and nutrients. Locally sourced.', (SELECT vegetables_id FROM category_ids), 30.00, NULL, 'bunch', 25, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Bell Peppers', 'bell-peppers', 'Colorful bell peppers - red, yellow, and green. Great for stir-fries and salads.', (SELECT vegetables_id FROM category_ids), 80.00, NULL, 'kg', 30, 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Fresh Carrots', 'fresh-carrots', 'Crunchy orange carrots, perfect for cooking and snacking. High in beta-carotene.', (SELECT vegetables_id FROM category_ids), 35.00, NULL, 'kg', 40, 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Green Beans', 'green-beans', 'Fresh green beans, crisp and tender. Perfect for Indian and continental dishes.', (SELECT vegetables_id FROM category_ids), 45.00, NULL, 'kg', 35, 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Onions', 'onions', 'Fresh red onions, essential for Indian cooking. Good storage quality.', (SELECT vegetables_id FROM category_ids), 25.00, 30.00, 'kg', 60, 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  
  -- Fruits
  ('Fresh Bananas', 'fresh-bananas', 'Sweet ripe bananas, rich in potassium and natural sugars. Perfect for breakfast.', (SELECT fruits_id FROM category_ids), 60.00, NULL, 'dozen', 100, 'https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Red Apples', 'red-apples', 'Crisp and sweet red apples, imported quality. Perfect for snacking and desserts.', (SELECT fruits_id FROM category_ids), 120.00, 140.00, 'kg', 60, 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Fresh Oranges', 'fresh-oranges', 'Juicy oranges packed with vitamin C. Sweet and tangy flavor.', (SELECT fruits_id FROM category_ids), 80.00, NULL, 'kg', 45, 'https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Green Grapes', 'green-grapes', 'Sweet seedless green grapes, perfect for snacking and fruit salads.', (SELECT fruits_id FROM category_ids), 100.00, NULL, 'kg', 35, 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Mangoes', 'mangoes', 'Sweet Alphonso mangoes, the king of fruits. Limited seasonal availability.', (SELECT fruits_id FROM category_ids), 200.00, 250.00, 'kg', 20, 'https://images.pexels.com/photos/1161547/pexels-photo-1161547.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Pomegranates', 'pomegranates', 'Fresh pomegranates with ruby red seeds. Rich in antioxidants.', (SELECT fruits_id FROM category_ids), 150.00, NULL, 'kg', 25, 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  
  -- Spices
  ('Turmeric Powder', 'turmeric-powder', 'Pure turmeric powder with anti-inflammatory properties. Essential for Indian cooking.', (SELECT spices_id FROM category_ids), 150.00, NULL, '500g', 20, 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Red Chili Powder', 'red-chili-powder', 'Spicy red chili powder for authentic Indian dishes. Medium heat level.', (SELECT spices_id FROM category_ids), 120.00, NULL, '500g', 25, 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Cumin Seeds', 'cumin-seeds', 'Aromatic cumin seeds for tempering and flavoring. Premium quality.', (SELECT spices_id FROM category_ids), 200.00, NULL, '250g', 15, 'https://images.pexels.com/photos/4198016/pexels-photo-4198016.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Garam Masala', 'garam-masala', 'Authentic garam masala blend for rich, aromatic dishes. House special recipe.', (SELECT spices_id FROM category_ids), 180.00, 200.00, '100g', 18, 'https://images.pexels.com/photos/4198018/pexels-photo-4198018.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Coriander Powder', 'coriander-powder', 'Fresh ground coriander powder, essential for Indian curries.', (SELECT spices_id FROM category_ids), 90.00, NULL, '250g', 30, 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Black Pepper', 'black-pepper', 'Premium black pepper powder, freshly ground for maximum flavor.', (SELECT spices_id FROM category_ids), 300.00, NULL, '100g', 12, 'https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  
  -- Groceries
  ('Basmati Rice', 'basmati-rice', 'Premium quality basmati rice with long grains and aromatic flavor. Aged for 2 years.', (SELECT groceries_id FROM category_ids), 180.00, NULL, '1kg', 50, 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Whole Wheat Flour', 'whole-wheat-flour', 'Fresh whole wheat flour for healthy rotis and bread. Stone ground.', (SELECT groceries_id FROM category_ids), 45.00, NULL, '1kg', 40, 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Toor Dal', 'toor-dal', 'High-quality toor dal, rich in protein and nutrients. Unpolished variety.', (SELECT groceries_id FROM category_ids), 120.00, NULL, '1kg', 30, 'https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=400', true),
  ('Sunflower Oil', 'sunflower-oil', 'Pure sunflower cooking oil for healthy cooking. Refined and filtered.', (SELECT groceries_id FROM category_ids), 140.00, 160.00, '1L', 25, 'https://images.pexels.com/photos/4110253/pexels-photo-4110253.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Sugar', 'sugar', 'Pure white sugar for daily use. Crystal clear quality.', (SELECT groceries_id FROM category_ids), 50.00, NULL, '1kg', 45, 'https://images.pexels.com/photos/4110254/pexels-photo-4110254.jpeg?auto=compress&cs=tinysrgb&w=400', false),
  ('Rock Salt', 'rock-salt', 'Natural rock salt, unrefined and mineral-rich. Healthy alternative to table salt.', (SELECT groceries_id FROM category_ids), 35.00, NULL, '1kg', 35, 'https://images.pexels.com/photos/4110255/pexels-photo-4110255.jpeg?auto=compress&cs=tinysrgb&w=400', false)
) AS products_data(name, slug, description, category_id, price, original_price, unit, stock, image_url, featured)
ON CONFLICT (slug) DO NOTHING;