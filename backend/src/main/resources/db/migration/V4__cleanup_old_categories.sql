-- Migration V4: Clean up old placeholder categories so only your 8 main categories are active
-- Move any products referencing old categories (like ID 1 Girls) to appropriate category (Lehenga Blouse)
UPDATE products SET category_id = 12 WHERE category_id IN (1, 2, 3, 4, 5, 6, 7, 8);

-- Remove old default placeholder categories (Girls, Boys, Baby Wear, Ethnic Wear, Dresses, Tops, Bottoms, New Arrivals)
DELETE FROM categories WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8);
