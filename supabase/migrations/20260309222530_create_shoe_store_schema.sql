/*
  # Shoe Store Database Schema

  ## Overview
  Complete e-commerce schema for a shoe store with authentication, products, cart, and orders.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique, required)
  - `email` (text, required)
  - `created_at` (timestamptz)
  
  ### `products`
  - `id` (uuid, primary key)
  - `name` (text, required) - Shoe model name
  - `brand` (text, required) - Nike, Adidas, New Balance
  - `price` (decimal, required)
  - `discount_price` (decimal, nullable) - For discounted items
  - `description` (text)
  - `image_url` (text)
  - `category` (text) - new_arrival, discount, event
  - `sizes` (jsonb) - Available sizes
  - `stock` (integer, default 0)
  - `created_at` (timestamptz)
  
  ### `cart_items`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `product_id` (uuid, references products)
  - `quantity` (integer, default 1)
  - `size` (text, required)
  - `created_at` (timestamptz)
  
  ### `orders`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `total_amount` (decimal, required)
  - `payment_method` (text) - visa, paypal, cash
  - `shipping_address` (text, required)
  - `delivery_date` (date)
  - `status` (text, default 'processing')
  - `contact_email` (text, required)
  - `contact_phone` (text, required)
  - `created_at` (timestamptz)
  
  ### `order_items`
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `product_id` (uuid, references products)
  - `quantity` (integer, required)
  - `size` (text, required)
  - `price` (decimal, required)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Profiles: Users can read all, but only update their own
  - Products: Public read access, no write access for regular users
  - Cart items: Users can only access their own cart
  - Orders: Users can only access their own orders
  - Order items: Users can only access items from their own orders
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand text NOT NULL,
  price decimal(10,2) NOT NULL,
  discount_price decimal(10,2),
  description text,
  image_url text,
  category text,
  sizes jsonb DEFAULT '[]'::jsonb,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  size text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, size)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount decimal(10,2) NOT NULL,
  payment_method text NOT NULL,
  shipping_address text NOT NULL,
  delivery_date date,
  status text DEFAULT 'processing',
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  size text NOT NULL,
  price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );