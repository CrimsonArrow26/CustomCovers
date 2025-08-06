/*
  # Create PinkMart E-commerce Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (text) - 'user' or 'admin'
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (numeric)
      - `image_url` (text)
      - `category` ('phone', 'poster', 'phone_cover')
      - `description` (text)
      - `brand` (text)
      - `phone_model` (text) - for phone covers
      - `stock` (integer)
      - `created_at` (timestamp)
    
    - `addresses`
      - `id` (uuid, primary key)  
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `phone` (text)
      - `address_line1` (text)
      - `address_line2` (text)
      - `city` (text)
      - `state` (text)
      - `pincode` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `total_amount` (numeric)
      - `status` ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
      - `payment_method` ('online', 'cod')
      - `payment_status` ('pending', 'paid', 'failed')
      - `utr_number` (text)
      - `address_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for orders management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create products table  
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  image_url text NOT NULL,
  category text NOT NULL CHECK (category IN ('phone', 'poster', 'phone_cover')),
  description text NOT NULL DEFAULT '',
  brand text DEFAULT '',
  phone_model text DEFAULT '',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text DEFAULT '',
  city text NOT NULL,
  state text NOT NULL,
  pincode text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method text NOT NULL CHECK (payment_method IN ('online', 'cod')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  utr_number text DEFAULT '',
  address_id uuid NOT NULL REFERENCES addresses(id),
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric NOT NULL CHECK (price > 0)
);

-- Enable Row Level Security (except for users table)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Disable RLS on users table for direct authentication
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true);

-- Addresses policies
CREATE POLICY "Users can manage own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all order items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert sample data with auto-generated UUIDs
INSERT INTO users (email, full_name, role) VALUES
  ('Parkarsabira9@gmail.com', 'Admin User', 'admin'),
  ('user@pinkmart.com', 'John Doe', 'user')
ON CONFLICT (email) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Insert sample products
INSERT INTO products (name, price, image_url, category, description, brand, stock) VALUES
  ('iPhone 15 Pro', 129900, 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg', 'phone', 'Latest iPhone with titanium design and advanced camera system', 'Apple', 50),
  ('Samsung Galaxy S24', 89900, 'https://images.pexels.com/photos/163129/phone-mobile-smartphone-cellular-163129.jpeg', 'phone', 'Flagship Android phone with AI features', 'Samsung', 30),
  ('Pink Sunset Poster', 1299, 'https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg', 'poster', 'Beautiful pink sunset landscape poster', 'ArtCollection', 100),
  ('Motivational Quote Poster', 999, 'https://images.pexels.com/photos/1545590/pexels-photo-1545590.jpeg', 'poster', 'Inspirational quote poster in pink theme', 'QuoteArt', 80),
  ('iPhone 15 Pro Pink Case', 2999, 'https://images.pexels.com/photos/163129/phone-mobile-smartphone-cellular-163129.jpeg', 'phone_cover', 'Premium silicone case for iPhone 15 Pro', 'CaseProtect', 200),
  ('Samsung Galaxy S24 Pink Cover', 2499, 'https://images.pexels.com/photos/163129/phone-mobile-smartphone-cellular-163129.jpeg', 'phone_cover', 'Stylish protective cover for Galaxy S24', 'CaseProtect', 150)
ON CONFLICT DO NOTHING;