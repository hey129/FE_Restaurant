CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- merchant table
CREATE TABLE merchant (
  merchant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_name text NOT NULL,
  address text,
  phone text,
  email text,
  status boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- category
CREATE TABLE category (
  category_id serial PRIMARY KEY,
  name text NOT NULL,
  icon_url text,
  status boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  merchant_id uuid REFERENCES merchant(merchant_id) ON DELETE CASCADE
);

-- product
CREATE TABLE product (
  product_id serial PRIMARY KEY,
  product_name text NOT NULL,
  category_id int REFERENCES category(category_id) ON DELETE SET NULL,
  price numeric(10,2) NOT NULL DEFAULT 0.00,
  image text,
  description text,
  rating numeric(3,1),
  status boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  merchant_id uuid REFERENCES merchant(merchant_id) ON DELETE CASCADE
);

CREATE INDEX idx_product_category ON product(category_id);

-- customer
CREATE TABLE customer (
  customer_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  phone text,
  address text,
  status boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- cart
CREATE TABLE cart (
  cart_id serial PRIMARY KEY,
  customer_id uuid REFERENCES customer(customer_id) ON DELETE CASCADE,
  product_id int REFERENCES product(product_id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  added_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  merchant_id uuid REFERENCES merchant(merchant_id) ON DELETE CASCADE
);

CREATE INDEX idx_cart_customer ON cart(customer_id);

-- orders
CREATE TABLE orders (
  order_id serial PRIMARY KEY,
  customer_id uuid REFERENCES customer(customer_id) ON DELETE SET NULL,
  order_date timestamptz DEFAULT now(),
  delivery_address text,
  total_amount numeric(12,2) NOT NULL DEFAULT 0.00,
  order_status text DEFAULT 'pending',
  payment_status text DEFAULT 'unpaid',
  note text,
  merchant_id uuid REFERENCES merchant(merchant_id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_customer ON orders(customer_id);

-- order_detail
CREATE TABLE order_detail (
  order_detail_id serial PRIMARY KEY,
  order_id int REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id int REFERENCES product(product_id) ON DELETE SET NULL,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_order_detail_order ON order_detail(order_id);

-- payment
CREATE TABLE payment (
  payment_id serial PRIMARY KEY,
  order_id int REFERENCES orders(order_id) ON DELETE CASCADE,
  payment_date timestamptz DEFAULT now(),
  amount numeric(12,2) NOT NULL,
  method text,
  transaction_id text,
  note text
);

CREATE INDEX idx_payment_order ON payment(order_id);

------------------------------------------------------------
-- SEED DATA
------------------------------------------------------------

-- Seed merchants
INSERT INTO merchant (merchant_name, address, phone, email) VALUES
  ('Phở Hà Nội', NULL, NULL, NULL),
  ('Cà Phê Sài Gòn', NULL, NULL, NULL),
  ('Seoul BBQ House', NULL, NULL, NULL),
  ('KFC', NULL, NULL, NULL),
  ('Jollibee', NULL, NULL, NULL),
  ('McDonald''s', NULL, NULL, NULL),
  ('Phúc Long', NULL, NULL, NULL),
  ('Katinat', NULL, NULL, NULL),
  ('Busan Korean Street Food', NULL, NULL, NULL),
  ('Cơm Tấm Phúc Lộc Thọ', NULL, NULL, NULL);

-- Seed categories
INSERT INTO category (name, merchant_id) SELECT 'Bánh Mì', merchant_id FROM merchant WHERE merchant_name='Phở Hà Nội';
INSERT INTO category (name, merchant_id) SELECT 'Bún', merchant_id FROM merchant WHERE merchant_name='Phở Hà Nội';
INSERT INTO category (name, merchant_id) SELECT 'Phở', merchant_id FROM merchant WHERE merchant_name='Phở Hà Nội';

INSERT INTO category (name, merchant_id) SELECT 'Cà phê', merchant_id FROM merchant WHERE merchant_name='Cà Phê Sài Gòn';
INSERT INTO category (name, merchant_id) SELECT 'Trà', merchant_id FROM merchant WHERE merchant_name='Cà Phê Sài Gòn';
INSERT INTO category (name, merchant_id) SELECT 'Đá xay', merchant_id FROM merchant WHERE merchant_name='Cà Phê Sài Gòn';

INSERT INTO category (name, merchant_id) SELECT 'BBQ', merchant_id FROM merchant WHERE merchant_name='Seoul BBQ House';
INSERT INTO category (name, merchant_id) SELECT 'Món phụ', merchant_id FROM merchant WHERE merchant_name='Seoul BBQ House';
INSERT INTO category (name, merchant_id) SELECT 'Soup', merchant_id FROM merchant WHERE merchant_name='Seoul BBQ House';

INSERT INTO category (name, merchant_id) SELECT 'Burger', merchant_id FROM merchant WHERE merchant_name='KFC';
INSERT INTO category (name, merchant_id) SELECT 'Combo', merchant_id FROM merchant WHERE merchant_name='KFC';
INSERT INTO category (name, merchant_id) SELECT 'Gà Rán', merchant_id FROM merchant WHERE merchant_name='KFC';

INSERT INTO category (name, merchant_id) SELECT 'Gà Rán', merchant_id FROM merchant WHERE merchant_name='Jollibee';
INSERT INTO category (name, merchant_id) SELECT 'Mỳ Ý', merchant_id FROM merchant WHERE merchant_name='Jollibee';
INSERT INTO category (name, merchant_id) SELECT 'Tráng Miệng', merchant_id FROM merchant WHERE merchant_name='Jollibee';
INSERT INTO category (name, merchant_id) SELECT 'Đồ Uống', merchant_id FROM merchant WHERE merchant_name='Jollibee';

INSERT INTO category (name, merchant_id) SELECT 'Burger', merchant_id FROM merchant WHERE merchant_name='McDonald''s';
INSERT INTO category (name, merchant_id) SELECT 'Khoai & Ăn vặt', merchant_id FROM merchant WHERE merchant_name='McDonald''s';
INSERT INTO category (name, merchant_id) SELECT 'Đồ Uống', merchant_id FROM merchant WHERE merchant_name='McDonald''s';

INSERT INTO category (name, merchant_id) SELECT 'Bánh ngọt', merchant_id FROM merchant WHERE merchant_name='Phúc Long';
INSERT INTO category (name, merchant_id) SELECT 'Trà', merchant_id FROM merchant WHERE merchant_name='Phúc Long';
INSERT INTO category (name, merchant_id) SELECT 'Trà Sữa', merchant_id FROM merchant WHERE merchant_name='Phúc Long';
INSERT INTO category (name, merchant_id) SELECT 'Đá Xay', merchant_id FROM merchant WHERE merchant_name='Phúc Long';

INSERT INTO category (name, merchant_id) SELECT 'Bánh ngọt', merchant_id FROM merchant WHERE merchant_name='Katinat';
INSERT INTO category (name, merchant_id) SELECT 'Cà phê', merchant_id FROM merchant WHERE merchant_name='Katinat';
INSERT INTO category (name, merchant_id) SELECT 'Trà', merchant_id FROM merchant WHERE merchant_name='Katinat';
INSERT INTO category (name, merchant_id) SELECT 'Đá xay', merchant_id FROM merchant WHERE merchant_name='Katinat';

INSERT INTO category (name, merchant_id) SELECT 'Kimbap', merchant_id FROM merchant WHERE merchant_name='Busan Korean Street Food';
INSERT INTO category (name, merchant_id) SELECT 'Mì Hàn', merchant_id FROM merchant WHERE merchant_name='Busan Korean Street Food';
INSERT INTO category (name, merchant_id) SELECT 'Tokbokki', merchant_id FROM merchant WHERE merchant_name='Busan Korean Street Food';
INSERT INTO category (name, merchant_id) SELECT 'Đồ Uống', merchant_id FROM merchant WHERE merchant_name='Busan Korean Street Food';

INSERT INTO category (name, merchant_id) SELECT 'Canh', merchant_id FROM merchant WHERE merchant_name='Cơm Tấm Phúc Lộc Thọ';
INSERT INTO category (name, merchant_id) SELECT 'Cơm Tấm', merchant_id FROM merchant WHERE merchant_name='Cơm Tấm Phúc Lộc Thọ';
INSERT INTO category (name, merchant_id) SELECT 'Nước giải khát', merchant_id FROM merchant WHERE merchant_name='Cơm Tấm Phúc Lộc Thọ';

------------------------------------------------------------
-- SEED PRODUCTS (NO SIZE, MIN PRICE)
------------------------------------------------------------

-- Products for Phở Hà Nội
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Phở' AS category_name, 'Phở Bò' AS product_name, 55000 AS price,
         'Phở Bò tại Phở Hà Nội.' AS description,
         'https://images.unsplash.com/photo-1579866997815-ecbb27a4dd43' AS image
  UNION ALL SELECT 'Phở', 'Phở Gà', 50000,
         'Phở Gà tại Phở Hà Nội.',
         'https://images.unsplash.com/photo-1579866997815-ecbb27a4dd43'
  UNION ALL SELECT 'Bún', 'Bún Chả', 60000,
         'Bún Chả tại Phở Hà Nội.',
         'https://images.unsplash.com/photo-1594020293008-5f99f60bd4d7'
  UNION ALL SELECT 'Bánh Mì', 'Bánh Mì Thịt Nướng', 30000,
         'Bánh Mì Thịt Nướng tại Phở Hà Nội.',
         'https://images.unsplash.com/photo-1524062008239-962eb6d3383d'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Phở Hà Nội';

-- Products for Cà Phê Sài Gòn
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Cà phê' AS category_name, 'Cà Phê Đen Đá' AS product_name, 15000 AS price,
         'Cà Phê Đen Đá tại Cà Phê Sài Gòn.' AS description,
         'https://images.unsplash.com/photo-1569315095807-995e6e3ba320' AS image
  UNION ALL SELECT 'Cà phê', 'Cà Phê Sữa Đá', 20000,
         'Cà Phê Sữa Đá tại Cà Phê Sài Gòn.',
         'https://images.unsplash.com/photo-1569315095807-995e6e3ba320'
  UNION ALL SELECT 'Trà', 'Trà Đào Cam Sả', 30000,
         'Trà Đào Cam Sả tại Cà Phê Sài Gòn.',
         'https://images.unsplash.com/photo-1513639725746-c5d3e861f32a'
  UNION ALL SELECT 'Đá xay', 'Cookie Đá Xay', 40000,
         'Cookie Đá Xay tại Cà Phê Sài Gòn.',
         'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Cà Phê Sài Gòn';

-- Products for Seoul BBQ House
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'BBQ' AS category_name, 'Ba Chỉ Heo Nướng' AS product_name, 175000 AS price,
         'Ba Chỉ Heo Nướng tại Seoul BBQ House.' AS description,
         'https://images.unsplash.com/photo-1604908176997-1251884b08a3' AS image
  UNION ALL SELECT 'BBQ', 'Sườn Bò Nướng', 245000,
         'Sườn Bò Nướng tại Seoul BBQ House.',
         'https://images.unsplash.com/photo-1604908176997-1251884b08a3'
  UNION ALL SELECT 'Soup', 'Kimchi Jjigae', 115000,
         'Kimchi Jjigae tại Seoul BBQ House.',
         'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f'
  UNION ALL SELECT 'Món phụ', 'Cơm Trắng', 10000,
         'Cơm Trắng tại Seoul BBQ House.',
         'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Seoul BBQ House';

-- Products for KFC
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Gà Rán' AS category_name, 'Gà Rán Giòn Cay' AS product_name, 54000 AS price,
         'Gà Rán Giòn Cay tại KFC.' AS description,
         'https://images.unsplash.com/photo-1608038509085-7bb9d5e595b4' AS image
  UNION ALL SELECT 'Gà Rán', 'Gà Rán Truyền Thống', 50000,
         'Gà Rán Truyền Thống tại KFC.',
         'https://images.unsplash.com/photo-1608038509085-7bb9d5e595b4'
  UNION ALL SELECT 'Burger', 'Burger Gà Quay', 64000,
         'Burger Gà Quay tại KFC.',
         'https://images.unsplash.com/photo-1550547660-d9450f859349'
  UNION ALL SELECT 'Combo', 'Combo Gà 3 Miếng', 94000,
         'Combo Gà 3 Miếng tại KFC.',
         'https://images.unsplash.com/photo-1604908176997-1251884b08a3'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'KFC';

-- Products for Jollibee
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Gà Rán' AS category_name, 'Gà Giòn Vui Vẻ' AS product_name, 54000 AS price,
         'Gà Giòn Vui Vẻ tại Jollibee.' AS description,
         'https://images.unsplash.com/photo-1608038509085-7bb9d5e595b4' AS image
  UNION ALL SELECT 'Mỳ Ý', 'Mỳ Ý Sốt Bò Bằm', 50000,
         'Mỳ Ý Sốt Bò Bằm tại Jollibee.',
         'https://images.unsplash.com/photo-1525755662778-989d0524087e'
  UNION ALL SELECT 'Tráng Miệng', 'Kem Ly Jollibee', 14000,
         'Kem Ly Jollibee tại Jollibee.',
         'https://images.unsplash.com/photo-1505253216365-3b315a505c53'
  UNION ALL SELECT 'Đồ Uống', 'Pepsi', 14000,
         'Pepsi tại Jollibee.',
         'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Jollibee';

-- Products for McDonald's
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Burger' AS category_name, 'Big Mac' AS product_name, 84000 AS price,
         'Big Mac tại McDonald''s.' AS description,
         'https://images.unsplash.com/photo-1550547660-d9450f859349' AS image
  UNION ALL SELECT 'Burger', 'Cheeseburger', 74000,
         'Cheeseburger tại McDonald''s.',
         'https://images.unsplash.com/photo-1550547660-d9450f859349'
  UNION ALL SELECT 'Khoai & Ăn vặt', 'Khoai Tây Chiên', 34000,
         'Khoai Tây Chiên tại McDonald''s.',
         'https://images.unsplash.com/photo-1482049016688-2d3e1b311543'
  UNION ALL SELECT 'Đồ Uống', 'Coca-Cola', 14000,
         'Coca-Cola tại McDonald''s.',
         'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'McDonald''s';

-- Products for Phúc Long
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Trà' AS category_name, 'Trà Oolong' AS product_name, 40000 AS price,
         'Trà Oolong tại Phúc Long.' AS description,
         'https://images.unsplash.com/photo-1513639725746-c5d3e861f32a' AS image
  UNION ALL SELECT 'Trà Sữa', 'Trà Sữa Truyền Thống', 44000,
         'Trà Sữa Truyền Thống tại Phúc Long.',
         'https://images.unsplash.com/photo-1544787219-7f47ccb76574'
  UNION ALL SELECT 'Đá Xay', 'Matcha Đá Xay', 54000,
         'Matcha Đá Xay tại Phúc Long.',
         'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
  UNION ALL SELECT 'Bánh ngọt', 'Bánh Mousse Trà Xanh', 30000,
         'Bánh Mousse Trà Xanh tại Phúc Long.',
         'https://images.unsplash.com/photo-1542838132-92c53300491e'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Phúc Long';

-- Products for Katinat
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Cà phê' AS category_name, 'Cold Brew' AS product_name, 50000 AS price,
         'Cold Brew tại Katinat.' AS description,
         'https://images.unsplash.com/photo-1569315095807-995e6e3ba320' AS image
  UNION ALL SELECT 'Trà', 'Trà Nhài Sữa', 44000,
         'Trà Nhài Sữa tại Katinat.',
         'https://images.unsplash.com/photo-1513639725746-c5d3e861f32a'
  UNION ALL SELECT 'Đá xay', 'Matcha Latte Đá Xay', 54000,
         'Matcha Latte Đá Xay tại Katinat.',
         'https://images.unsplash.com/photo-1509042239860-f550ce710b93'
  UNION ALL SELECT 'Bánh ngọt', 'Croissant Bơ', 27000,
         'Croissant Bơ tại Katinat.',
         'https://images.unsplash.com/photo-1542838132-92c53300491e'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Katinat';

-- Products for Busan Korean Street Food
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Tokbokki' AS category_name, 'Tokbokki Phô Mai' AS product_name, 60000 AS price,
         'Tokbokki Phô Mai tại Busan Korean Street Food.' AS description,
         'https://images.unsplash.com/photo-1597905043337-e9b4b1548c07' AS image
  UNION ALL SELECT 'Kimbap', 'Kimbap Truyền Thống', 44000,
         'Kimbap Truyền Thống tại Busan Korean Street Food.',
         'https://images.unsplash.com/photo-1583623025817-d180a2221d0a'
  UNION ALL SELECT 'Mì Hàn', 'Mì Lạnh Hàn Quốc', 70000,
         'Mì Lạnh Hàn Quốc tại Busan Korean Street Food.',
         'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56'
  UNION ALL SELECT 'Đồ Uống', 'Sữa Chuối Hàn Quốc', 30000,
         'Sữa Chuối Hàn Quốc tại Busan Korean Street Food.',
         'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Busan Korean Street Food';

-- Products for Cơm Tấm Phúc Lộc Thọ
INSERT INTO product (merchant_id, category_id, product_name, price, description, image)
SELECT m.merchant_id, c.category_id, v.product_name, v.price, v.description, v.image
FROM merchant m
JOIN (
  SELECT 'Cơm Tấm' AS category_name, 'Cơm Tấm Sườn Bì Chả' AS product_name, 64000 AS price,
         'Cơm Tấm Sườn Bì Chả tại Cơm Tấm Phúc Lộc Thọ.' AS description,
         'https://images.unsplash.com/photo-1584270354949-c26b0caa5bdb' AS image
  UNION ALL SELECT 'Cơm Tấm', 'Cơm Tấm Sườn Trứng', 60000,
         'Cơm Tấm Sườn Trứng tại Cơm Tấm Phúc Lộc Thọ.',
         'https://images.unsplash.com/photo-1584270354949-c26b0caa5bdb'
  UNION ALL SELECT 'Canh', 'Canh Chua Cá Lóc', 30000,
         'Canh Chua Cá Lóc tại Cơm Tấm Phúc Lộc Thọ.',
         'https://images.unsplash.com/photo-1540337706094-67563e43c4ea'
  UNION ALL SELECT 'Nước giải khát', 'Nước Sâm', 10000,
         'Nước Sâm tại Cơm Tấm Phúc Lộc Thọ.',
         'https://images.unsplash.com/photo-1542744173-8e7e53415bb0'
) v ON TRUE
JOIN category c ON c.merchant_id = m.merchant_id AND c.name = v.category_name
WHERE m.merchant_name = 'Cơm Tấm Phúc Lộc Thọ';



-- ==========================
-- 10) View tiện cho frontend
-- ==========================
create or replace view v_product_with_category as
select
       p.product_id,
       p.product_name,
       p.price,
       p.image,
       p.description,
       p.rating,
       p.status,
       p.merchant_id,
       m.merchant_name,
       c.category_id,
       c.name as category_name,
       c.icon_url
from product p
left join merchant m on m.merchant_id = p.merchant_id
left join category c on c.category_id = p.category_id;