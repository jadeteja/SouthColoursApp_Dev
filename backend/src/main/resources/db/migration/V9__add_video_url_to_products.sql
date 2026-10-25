-- Add video_url column to products table
ALTER TABLE products ADD COLUMN video_url VARCHAR(1000) NULL AFTER is_new_arrival;
