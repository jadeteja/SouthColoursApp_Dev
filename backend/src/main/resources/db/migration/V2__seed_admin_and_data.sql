-- ==========================================================
-- Southcolours Seed Default Admin & Sample Catalog
-- ==========================================================

-- Default Admin Account
-- Email: admin@southcolours.com
-- Password: password123 (BCrypt hash: $2a$10$w81oXq5a4k2iQWj4iXkFxe8K2Bq5w5fCqK9jE9L7kX3v8K2Bq5w5f)
INSERT INTO users (id, email, password_hash, full_name, phone_number, is_active)
VALUES (1, 'admin@southcolours.com', '$2a$10$7zB3j69mQ.V7kQWbO8d1y.x50Y5kF2wP6v6m4g6Z7s5m9v8x9y0z1', 'Store Administrator', '+91 9876543210', TRUE)
ON DUPLICATE KEY UPDATE email=email;

-- Assign ROLE_ADMIN and ROLE_SUPER_ADMIN to default admin
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE name IN ('ROLE_ADMIN', 'ROLE_SUPER_ADMIN');

-- Sample Categories
INSERT INTO categories (id, parent_id, name, slug, display_order, is_active) VALUES
(1, NULL, 'Girls', 'girls', 1, TRUE),
(2, NULL, 'Boys', 'boys', 2, TRUE),
(3, NULL, 'Baby Wear', 'baby-wear', 3, TRUE),
(4, NULL, 'Ethnic Wear', 'ethnic-wear', 4, TRUE),
(5, NULL, 'Dresses', 'dresses', 5, TRUE),
(6, NULL, 'Tops', 'tops', 6, TRUE),
(7, NULL, 'Bottoms', 'bottoms', 7, TRUE),
(8, NULL, 'New Arrivals', 'new-arrivals', 8, TRUE)
ON DUPLICATE KEY UPDATE name=name;
