-- Letlalo E-commerce Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  images TEXT[] DEFAULT '{}',
  category TEXT,
  inventory_count INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  is_sold_out BOOLEAN DEFAULT false,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admin users table (for authentication)
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order status history for tracking
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_visible ON products(is_visible);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_order_number TEXT;
BEGIN
  new_order_number := 'LTL-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read visible products, only admins can modify
CREATE POLICY "Public can view visible products" ON products
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins can do everything with products" ON products
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
  );

-- Orders: Customers can create orders, admins can view/modify all
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
  );

CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
  );

-- Categories: Everyone can read, only admins can modify
CREATE POLICY "Public can view visible categories" ON categories
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Admins can do everything with categories" ON categories
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
  );

-- Order status history: Customers can read their order history, admins can do everything
CREATE POLICY "Customers can view their order history" ON order_status_history
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can do everything with order history" ON order_status_history
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (SELECT email FROM admin_users)
  );

-- Admin users: Only viewable by authenticated users who exist in the admin_users table
-- Using EXISTS to check if the current user is an admin without causing recursion
CREATE POLICY "Admins can view admin users" ON admin_users
  FOR SELECT USING (
    email = auth.jwt() ->> 'email'
  );

CREATE POLICY "Admins can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' IS NOT NULL
  );

-- Insert some sample categories
INSERT INTO categories (name, slug, description, is_visible) VALUES
  ('Gift Sets', 'gift-sets', 'Curated Afrocentric gift sets', true),
  ('Accessories', 'accessories', 'Unique African-inspired accessories', true),
  ('Home Decor', 'home-decor', 'Beautiful home decoration items', true),
  ('Stationery', 'stationery', 'Notebooks, journals, and writing accessories', true);

-- Insert sample products (you can customize these)
INSERT INTO products (name, description, price, category, inventory_count, is_visible, slug, images) VALUES
  (
    'The Kyauta Box',
    'Premium gift box featuring curated Afrocentric items perfect for any occasion.',
    25000.00,
    'gift-sets',
    15,
    true,
    'kyauta-box',
    ARRAY['https://placeholder-url.com/kyauta-box.jpg']
  ),
  (
    'Woven Raffia Bag',
    'Handcrafted raffia bag with leather details. Perfect for everyday use.',
    18000.00,
    'accessories',
    8,
    true,
    'woven-raffia-bag',
    ARRAY['https://placeholder-url.com/raffia-bag.jpg']
  ),
  (
    'Ankara Journal Set',
    'Beautiful set of journals with authentic Ankara fabric covers.',
    12000.00,
    'stationery',
    20,
    true,
    'ankara-journal-set',
    ARRAY['https://placeholder-url.com/journal.jpg']
  );

-- Insert admin user (replace with your email)
-- You'll need to create this user in Supabase Auth first
-- INSERT INTO admin_users (email, name, role) VALUES
--   ('your-email@example.com', 'Admin Name', 'admin');
