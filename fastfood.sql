-- ==========================
-- Schema: Food / Restaurant
-- Supabase + Auth compatible
-- ==========================

-- 1) category
create table if not exists category (
  category_id serial primary key,
  name text not null unique,
  icon_url text,
  status boolean default true, -- ẩn/hiện danh mục
  created_at timestamptz default now()
);

-- 2) product
create table if not exists product (
  product_id serial primary key,
  product_name text not null,
  category_id int references category(category_id) on delete set null,
  price numeric(10,2) not null default 0.00,
  image text,
  description text,
  rating numeric(3,1),
  status boolean not null default true, -- available / unavailable
  created_at timestamptz default now()
);

create index if not exists idx_product_category on product(category_id);

-- 3) customer
-- Dùng hệ thống đăng nhập của Supabase (auth.users)
-- Không lưu mật khẩu ở đây — chỉ tham chiếu tới auth.users.id

create table if not exists customer (
  customer_id uuid primary key references auth.users(id) on delete cascade,
  customer_name text not null,
  phone text,
  address text,
  status boolean default true,
  created_at timestamptz default now()
);



-- 6) cart
create table if not exists cart (
  cart_id serial primary key,
  customer_id uuid references customer(customer_id) on delete cascade,
  product_id int references product(product_id) on delete set null,
  quantity int not null default 1,
  price numeric(10,2) not null, -- snapshot tại thời điểm thêm vào giỏ
  added_at timestamptz default now(),
  status text default 'active' -- active, checked_out, saved...
);

create index if not exists idx_cart_customer on cart(customer_id);

-- 7) orders
create table if not exists orders (
  order_id serial primary key,
  customer_id uuid references customer(customer_id) on delete set null,
  order_date timestamptz default now(),
  delivery_address text,
  total_amount numeric(12,2) not null default 0.00,
  order_status text default 'pending', -- pending, preparing, delivered, cancelled
  payment_status text default 'unpaid', -- unpaid, paid, refunded
  staff_id int references staff(staff_id), -- ai xử lý đơn
  note text
);

create index if not exists idx_orders_customer on orders(customer_id);

-- 😎 order_detail
create table if not exists order_detail (
  order_detail_id serial primary key,
  order_id int references orders(order_id) on delete cascade,
  product_id int references product(product_id) on delete set null,
  quantity int not null default 1,
  price numeric(10,2) not null, -- đơn giá tại thời điểm order
  created_at timestamptz default now()
);

create index if not exists idx_order_detail_order on order_detail(order_id);

-- 9) payment
create table if not exists payment (
  payment_id serial primary key,
  order_id int references orders(order_id) on delete cascade,
  payment_date timestamptz default now(),
  amount numeric(12,2) not null,
  method text, -- 'card', 'cash', 'stripe', 'wallet'
  transaction_id text, -- optional từ cổng thanh toán
  note text
);

create index if not exists idx_payment_order on payment(order_id);

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
  c.category_id,
  c.name as category_name,
  c.icon_url
from product p
left join category c on c.category_id = p.category_id;


insert into category (category_id, name, icon_url, status) values
(1, 'Rolls', 'https://cdn-icons-png.flaticon.com/512/706/706195.png', true),
(2, 'Burgers', 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', true),
(3, 'Bar B Q', 'https://cdn-icons-png.flaticon.com/512/4341/4341053.png', true),
(4, 'Handi & Biryani', 'https://cdn-icons-png.flaticon.com/512/3364/3364826.png', true),
(5, 'Karhai', 'https://cdn-icons-png.flaticon.com/512/3082/3082031.png', true),
(6, 'Fish', 'https://cdn-icons-png.flaticon.com/512/135/135620.png', true),
(7, 'Daal & Sabzi', 'https://cdn-icons-png.flaticon.com/512/599/599120.png', true),
(8, 'Paratha', 'https://cdn-icons-png.flaticon.com/512/3174/3174888.png', true),
(9, 'Sandwiches', 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png', true),
(10, 'Snacks / Fries', 'https://cdn-icons-png.flaticon.com/512/859/859270.png', true),
(11, 'Drinks', 'https://cdn-icons-png.flaticon.com/512/2738/2738730.png', true);

INSERT INTO product (product_name, category_id, price, image, description, rating, status) VALUES
('Aloo Paratha', 8, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2Faloo%20paratha.png?alt=media&token=4a3f32e0-9e4d-4d49-80eb-f46a2fb9fd5d', 'Aloo Paratha is a popular whole wheat flatbread stuffed with spicy potato filling. Best enjoyed with yogurt and butter!', 4.8, true),
('Aloo Paratha Cheese', 8, 200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2Faloo%20paratha%20cheese.png?alt=media&token=578caaf7-0498-458a-a8dd-b8abf40c2030', 'Aloo Paratha cheese is a popular whole wheat flatbread stuffed with spicy potato and cheese filling.', 3.3, true),
('Bar B Q Cheese Club Sandwich', 9, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FSandwiches%2Fbarbq%20cheese%20sandwich.png?alt=media&token=7fae9795-a6db-4588-9b54-0e27d5b5f44a', 'Bar B Q Cheese Club Sandwich is a three slices of bread with two layers of BarBQ, cheese and tomato.', 4.0, true),
('Bar B Q Club Sandwich', 9, 300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FSandwiches%2Fbarbq%20club%20sandwich.png?alt=media&token=a4029193-2f73-41d1-aece-e5b120be8afc', 'Bar B Q Club Sandwich is a three slices of bread with two layers of BarBQ, lettuce, tomato and mayonnaise.', 4.3, true),
('Buddy Pack', 11, 50.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FDrinks%2Fbuddy%20pack.png?alt=media&token=f05bfb2c-bca1-4e5c-b732-50654a150ea7', 'Cold Drinks of 345ml', 3.9, true),
('Chicken Bar B Q Sauce Roll', 1, 130.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-barbq-roll.png?alt=media&token=a34a71c1-7c60-4bf2-807b-cd3ee6faa0ee', 'Roll with Bar B Q, mayonnaise and sauce', 4.4, true),
('Chicken Boti Plate', 3, 300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fch-boti-plate.png?alt=media&token=7b1bdd90-feae-4e26-a41b-844428b16ca7', 'Chicken Boti that is made with marinated boneless pieces of chicken that are skewered & cooked until just tender & juicy', 3.4, true),
('Chicken Broast Roll', 1, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fbroast-roll.png?alt=media&token=f45b0662-0648-4ff1-a6f3-fd96d2506c9c', 'Roll with broast and ketchup', 3.9, true),
('Chicken Burger', 2, 180.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBurgers%2Fch-burger.png?alt=media&token=6f5f0b09-8c0b-4ed4-9d9d-2c5e7a1e23f1', 'Burger with kabab and ketchup', 3.5, true),
('Chicken Chatni Roll', 1, 120.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-chatni-roll.png?alt=media&token=8cbeaecc-e66e-4ef0-850c-6de09f3d4345', 'Roll with yogurt marinated chicken and lemon juice mixture', 3.7, true),
('Chicken Cheese Burger', 2, 250.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBurgers%2Fch-cheese-burger.png?alt=media&token=abad140a-7716-4f9a-87bf-e5f9151f7fcd', 'Burger with kabab and cheese', 3.8, true),
('Chicken Cheese Roll', 1, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-cheese-roll.png?alt=media&token=bb883a25-7a34-4d33-be3f-773aaf09f7ef', 'Roll with yogurt marinated chicken and cheese', 3.3, true),
('Chicken Cheese Zinger Burger', 2, 250.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBurgers%2Fch-zinger-cheese-burger.png?alt=media&token=c0e77c22-1eba-485c-b958-25cd0856d54c', 'Burger with crispy chicken, lettuce and cheese', 4.9, true),
('Chicken Gola Kabab Plate', 3, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fgola-kabab.png?alt=media&token=c872d5a4-7336-44a0-a399-2903ed0b3d0f', 'Chicken Gola Kabab are melt in the mouth, oval-shaped kababs that are seasoned with Pakistani spices and are incredibly juicy. They are traditionally grilled over charcoal', 3.2, true),
('Chicken Green Boti Plate', 3, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fgreen-boti-plate.png?alt=media&token=1c1ce9fa-82c5-4ed6-acaf-3d37ace7adc7', 'Chicken Green Boti that is made with marinated boneless pieces of chicken that are skewered & cooked with green chatni until just tender & juicy', 4.5, true),
('Chicken Green Tikka', 3, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fch%20tikka%20green.png?alt=media&token=5328a45f-26c1-4e78-a097-40ea1d82f4e3', 'Chicken Green Tikka is made with marinated pieces of chicken that are skewered & cooked with green chatni until just tender & juicy', 4.9, true),
('Chicken Handi Briyani (Full)', 4, 1000.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fhandi%20biryani.png?alt=media&token=17ff27a6-903b-487f-a005-bf58e35a89f2', 'Chicken Handi Briyani is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful', 4.3, true),
('Chicken Handi Briyani (Half)', 4, 500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fhandi%20biryani.png?alt=media&token=17ff27a6-903b-487f-a005-bf58e35a89f2', 'Chicken Handi Briyani is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful', 3.9, true),
('Chicken Karhai Achari', 5, 1300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2Fkarhai%20achari.png?alt=media&token=07451d23-523d-4721-9e4a-698d98f01dc5', 'Chicken Karhai Achari is tangy just like achar and has a reddish appearance. Traditionally, spices are mixed with lemon juice to form a thick paste.', 4.0, true),
('Chicken Karhai Balochi', 5, 1300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2Fbalochi%20karahai.png?alt=media&token=f00a59db-fee3-44ec-a99e-8e881a21fe62', 'The taste of this Balochi style Chicken Karhai is a burst of tangy spiciness in the mouth. The fried chicken and fried garlic taste amazing.', 4.7, true),
('Chicken Karhai Brown', 5, 1200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2Fbrown%20karhai.png?alt=media&token=d0e921ad-41c5-4109-a492-3382a05d19fb', 'Chicken Karhai Brown is cooked in a yogurt and black pepper based sauce, freshly crushed black pepper (kali mirch) for maximum taste', 3.9, true),
('Chicken Karhai Green', 5, 1300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2FChicken-Green-Karahi.png?alt=media&token=a7d8690d-af9b-4d4d-a51b-5151e82758db', 'Chicken Green Karhai is popular for its aromatic green chilli spice with light hints of black Pepper', 3.4, true),
('Chicken Karhai Red', 5, 1200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2Fred%20karhai.png?alt=media&token=1d8b0821-ad74-41e4-9e85-2ffcef7cbad9', 'Chicken karhai red distinguishing features are its rich, tomatoey base and a fragrant finishing of green chili peppers, cilantro, and slivers of ginger.', 3.8, true),
('Chicken Karhai White', 5, 1300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2F-White-Karahi.png?alt=media&token=f44304d6-8fa0-4193-a760-78553caa5cbc', 'Chicken White Karhai is creamy, savoury and just super delicious. It is a spicy, creamy chicken curry, what’s there not to like? 🙂', 3.0, true),
('Chicken Makhni Handi (Full)', 4, 1500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fmakhni%20handi.png?alt=media&token=88a34836-1685-4e37-b468-4cb222a5d3d8', 'Chicken Makhni Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.2, true),
('Chicken Makhni Handi (Half)', 4, 800.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fmakhni%20handi.png?alt=media&token=88a34836-1685-4e37-b468-4cb222a5d3d8', 'Chicken Makhni Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.5, true),
('Chicken Malai Boti Plate', 3, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fmalai%20boti.png?alt=media&token=6916d5a7-e56c-4db4-a328-a56c31e0c344', 'Chicken Malai Boti is made with cream marinated boneless pieces of chicken that are skewered & cooked until just tender & juicy', 3.8, true),
('Chicken Malai Boti Roll', 1, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fmalai%20boti%20roll.png?alt=media&token=658dd7f1-29a9-43c2-941c-50aacca81a74', 'Roll with yogurt, garlic, ginger, cream and mint chatni marinated chicken and mayonnaise', 3.6, true),
('Chicken Malai Tikka', 3, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fchicken-malai-tikka.png?alt=media&token=f2373c26-708e-4f85-af28-34dfa6097246', 'Chicken Malai Tikka is made with cream marinated pieces of chicken that are skewered & cooked until just tender & juicy', 3.8, true),
('Chicken Mayo Roll', 1, 120.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-mayo-roll.png?alt=media&token=1847c264-f1ac-4f30-a4d6-9fe180fd9314', 'Roll with yogurt marinated chicken and mayonnaise', 3.1, true),
('Chicken Paneeri Handi (Full)', 4, 1500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fch-paneeri%20handi.png?alt=media&token=7d191254-24a3-4aea-8f61-09f745037993', 'Chicken Paneeri Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.3, true),
('Chicken Paneeri Handi (Half)', 4, 800.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fch-paneeri%20handi.png?alt=media&token=7d191254-24a3-4aea-8f61-09f745037993', 'Chicken Paneeri Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.1, true),
('Chicken Paratha', 8, 200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2Fchicken%20paratha.png?alt=media&token=3e1de6a0-b0f9-49c9-ac6e-cc41732a689a', 'Chicken Paratha is a popular whole wheat flatbread stuffed with spicy chicken filling. Best enjoyed with yogurt and butter!', 3.8, true),
('Chicken Paratha Cheese', 8, 250.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2FChicken-Cheese-Paratha.png?alt=media&token=435f3490-1a65-40b9-ad72-ea8d5cb77685', 'Chicken Paratha cheese is a popular whole wheat flatbread stuffed with spicy chicken and cheese filling. Best enjoyed with yogurt and butter!', 3.3, true),
('Chicken Qorma', 5, 200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FKarhai%2Fch%20qorma.png?alt=media&token=89e5db09-e5ec-457e-bce5-b5ada74a1e68', 'Chicken Qorma is a dry preparation that can be enjoyed as an appetizer, with Rotis and white rice.', 4.2, true),
('Chicken Red Handi (Full)', 4, 1500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fred-handi.png?alt=media&token=a7e94b71-b81e-4ce8-be04-55cb45410a52', 'Chicken Red Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.2, true),
('Chicken Red Handi (Half)', 4, 800.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fred-handi.png?alt=media&token=a7e94b71-b81e-4ce8-be04-55cb45410a52', 'Chicken Red Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 4.4, true),
('Chicken Reshmi Kabab Plate', 3, 300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fch-reshmi-kabab-plate.png?alt=media&token=b808d586-cb10-4fde-8d96-9e8595131051', 'Chicken Reshmi Kabab is made with Pieces of Boneless Chicken, marinated in juicy mixture of Curd, Cream, & Spices', 4.5, true),
('Chicken Reshmi Kabab Roll', 1, 120.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-reshmi-kabab-roll.png?alt=media&token=5c0eeea4-79ae-4429-81d3-158b0190c2fe', 'Roll with chicken and reshmi kabab masaala', 3.5, true),
('Chicken Spicy Roll', 1, 120.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FRolls%2Fch-spicy-roll.png?alt=media&token=d9119c7e-b2d2-41c2-b41b-7296d2354b9d', 'Roll with yogurt marinated chicken and spices', 4.2, true),
('Chicken Tikka', 3, 250.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBar%20B%20Q%2Fch-tikka.png?alt=media&token=80b85b1d-26f7-4b92-ae58-7cfa201051be', 'Chicken Tikka that is made with marinated pieces of chicken that are skewered & cooked until just tender & juicy', 3.0, true),
('Chicken White Handi (Full)', 4, 1500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fwhite-handi.png?alt=media&token=5661523c-69f0-422e-9007-98e9164eaf90', 'Chicken White Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.6, true),
('Chicken White Handi (Half)', 4, 800.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2Fwhite-handi.png?alt=media&token=5661523c-69f0-422e-9007-98e9164eaf90', 'Chicken White Handi is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful chicken curry', 3.8, true),
('Chicken Zinger Burger', 2, 200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FBurgers%2Fzinger-burger.png?alt=media&token=26ebcca7-5197-482c-aff2-65aa057e564b', 'Burger with crispy chicken, lettuce and ketchup', 4.3, true),
('Club Cheese Sandwich', 9, 350.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FSandwiches%2Fclub%20cheese%20sandwich.png?alt=media&token=fb75e97f-6cd6-47de-ae58-d41f148b7e66', 'Club Cheese Sandwich is a three slices of bread with two layers of meat and cheese with tomato and mayonnaise.', 3.4, true),
('Club Sandwich', 9, 300.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FSandwiches%2Fclub%20sandwich.png?alt=media&token=cf30dcc4-5c5d-41da-94d8-bebf38e03c72', 'Club Sandwich is a three slices of bread with two layers of meat and lettuce, tomato and mayonnaise.', 5.0, true),
('Cold Drinks (1.5Ltr)', 11, 130.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FDrinks%2Fcold%20drinks%201.5ltr.png?alt=media&token=d717712c-6109-4a7c-bdf3-dbbff1200cdf', 'Cold Drinks of 1.5 litre', 3.2, true),
('Daal Chana', 7, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FDal%20Sabzi%2Fdal%20channa.png?alt=media&token=548991c0-9dc9-451b-a6fb-1abc84de0216', 'Daal Chana a spicy and tempting curry prepared from white chickpeas (kabuli chana), tomatoes, onion', 3.7, true),
('Daal Mung', 7, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FDal%20Sabzi%2Fdal%20mung.png?alt=media&token=26d638ce-a935-4e3b-97e9-0e7b53eee9af', 'Daal Mung is a healthy comfort food prepared from yellow split lentil (green split gram without skin) and many spices.', 3.2, true),
('Fish BBQ - (6 Pieces)', 6, 700.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FFish%2Fbbq%20Fish.png?alt=media&token=7cc5b8dc-9354-41ba-95de-fbf021c40fad', 'Fish BBQ is a perfect treat for seafood lovers. It is a perfect fusion of sea food with Desi Barbeque flavor that blends well to bring out a unique dish', 4.1, true),
('Fish Fry', 6, 1200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FFish%2Ffish%20fry.png?alt=media&token=3b3a4ff6-bcc9-4c91-8b27-a2d6f6f23165', 'Fish Fry is a mouth-watering and very tempting fried fish recipe made using fresh fish pieces coming out straight from freshwater.', 3.4, true),
('Fish Karhai', 6, 1500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FFish%2Ffish_karhai.png?alt=media&token=9ffa5f8c-52f2-42b9-93b0-5c6d5b61bf10', 'Fish Karhai is a semi-dry spicy fish recipe cooked in the tomato puree.', 4.5, true),
('French Fries Plate Full', 10, 100.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FFrench%20Fries%2Ffries.png?alt=media&token=7bb88b3a-d409-4f38-b409-638072c6b041', 'A thin strip of potato, usually cut 3 to 4 inches in length that are deep fried until they are golden brown and crisp textured on the outside', 4.1, true),
('Makhni Handi Daal (Full)', 4, 900.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2FDal-Makhani%20handi.png?alt=media&token=a5e98701-8c1b-4df3-b6c3-e0f75954e293', 'Makhni Handi Daal is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful', 4.1, true),
('Makhni Handi Daal (Half)', 4, 500.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FHandi%2FDal-Makhani%20handi.png?alt=media&token=a5e98701-8c1b-4df3-b6c3-e0f75954e293', 'Makhni Handi Daal is traditionally cooked in a clay pot. It is a mild and creamy and oh so flavourful', 3.4, true),
('Mayo French Fries Plate Full', 10, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FFrench%20Fries%2Fmayo_fries.png?alt=media&token=31ae9584-8ee3-4fed-b45c-12b19a5a3112', 'Fries are served with mayonnaise', 4.2, true),
('Mix Vegetable', 7, 150.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FDal%20Sabzi%2FMix-Vegetable.png?alt=media&token=05e50485-ad77-4b9f-83ca-cea0ef53d666', 'Mix vegetable curry is made by cooking a mixture of vegetables together in a traditional onion-tomato gravy. The dish is characterized by multiple flavors.', 3.8, true),
('Sada Paratha', 8, 30.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2FPlain-Paratha.png?alt=media&token=f1cf4796-402c-48ef-83f5-430395b70276', 'Sada Paratha is yummy triangle shaped flat-bread made of whole-wheat flour.', 4.4, true),
('Vegetable Paratha', 8, 200.00, 'https://firebasestorage.googleapis.com/v0/b/bm-restaurant.appspot.com/o/Menu%20images%2FParatha%2Fveg%20paratha.png?alt=media&token=8f2ccd3a-860e-40f9-a1c0-124be739b384', 'Vegetables Paratha is a popular whole wheat flatbread stuffed with spicy vegetables filling. Best enjoyed with yogurt and butter!', 4.1, true);
