-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.cart (
  cart_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_id uuid,
  product_id integer,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  added_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active'::text,
  merchant_id uuid,
  CONSTRAINT cart_pkey PRIMARY KEY (cart_id),
  CONSTRAINT cart_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id),
  CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id),
  CONSTRAINT cart_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant(merchant_id)
);
CREATE TABLE public.category (
  category_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  status boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  merchant_id uuid,
  CONSTRAINT category_pkey PRIMARY KEY (category_id),
  CONSTRAINT category_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant(merchant_id)
);
CREATE TABLE public.customer (
  customer_id uuid NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL UNIQUE,
  address text,
  status boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  email text NOT NULL DEFAULT ''::text,
  CONSTRAINT customer_pkey PRIMARY KEY (customer_id),
  CONSTRAINT customer_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES auth.users(id)
);
CREATE TABLE public.delivery_assignment (
  assignment_id bigint NOT NULL DEFAULT nextval('delivery_assignment_assignment_id_seq'::regclass),
  order_id integer,
  drone_id uuid,
  assigned_at timestamp with time zone DEFAULT now(),
  pickup_lat double precision,
  pickup_lng double precision,
  drop_lat double precision,
  drop_lng double precision,
  status text DEFAULT 'assigned'::text,
  completed_at timestamp with time zone,
  CONSTRAINT delivery_assignment_pkey PRIMARY KEY (assignment_id),
  CONSTRAINT delivery_assignment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT delivery_assignment_drone_id_fkey FOREIGN KEY (drone_id) REFERENCES public.drone(drone_id)
);
CREATE TABLE public.drone (
  drone_id uuid NOT NULL DEFAULT gen_random_uuid(),
  model text NOT NULL,
  status text DEFAULT 'idle'::text,
  battery numeric DEFAULT 100,
  max_speed numeric,
  payload_limit numeric,
  current_lat double precision,
  current_lng double precision,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT drone_pkey PRIMARY KEY (drone_id)
);
CREATE TABLE public.merchant (
  merchant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  merchant_name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  status boolean DEFAULT true,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT merchant_pkey PRIMARY KEY (merchant_id),
  CONSTRAINT merchant_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.order_detail (
  order_detail_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id integer,
  product_id integer,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_detail_pkey PRIMARY KEY (order_detail_id),
  CONSTRAINT order_detail_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id),
  CONSTRAINT order_detail_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(product_id)
);
CREATE TABLE public.orders (
  order_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  customer_id uuid,
  order_date timestamp with time zone DEFAULT now(),
  delivery_address text,
  total_amount numeric NOT NULL DEFAULT 0.00,
  order_status text DEFAULT 'pending'::text,
  payment_status text DEFAULT '''paid''::text'::text,
  note text,
  merchant_id uuid,
  CONSTRAINT orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer(customer_id),
  CONSTRAINT orders_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant(merchant_id)
);
CREATE TABLE public.payment (
  payment_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  order_id integer,
  payment_date timestamp with time zone DEFAULT now(),
  amount numeric NOT NULL,
  method text,
  transaction_id text,
  note text,
  CONSTRAINT payment_pkey PRIMARY KEY (payment_id),
  CONSTRAINT payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id)
);
CREATE TABLE public.product (
  product_id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  product_name text NOT NULL,
  category_id integer,
  price numeric NOT NULL DEFAULT 0.00,
  image text,
  description text,
  rating numeric,
  status boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  merchant_id uuid,
  CONSTRAINT product_pkey PRIMARY KEY (product_id),
  CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(category_id),
  CONSTRAINT product_merchant_id_fkey FOREIGN KEY (merchant_id) REFERENCES public.merchant(merchant_id)
);