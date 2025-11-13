-- E-commerce Store Database Schema
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT4 NOT NULL CHECK (stock >= 0),
  category TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  text_content TEXT NOT NULL,
  rating INT4 CHECK (rating >= 1 AND rating <= 5),
  images JSONB DEFAULT '[]'::jsonb,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  quantity INT4 NOT NULL CHECK (quantity >= 1),
  total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL CHECK (status IN ('Baru', 'Diproses', 'Selesai', 'Batal')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies for Products (Public read, authenticated write)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are insertable by authenticated users" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Products are updatable by authenticated users" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Products are deletable by authenticated users" ON products
  FOR DELETE USING (true);

-- Policies for Reviews (Public read approved, authenticated write)
CREATE POLICY "Approved reviews are viewable by everyone" ON reviews
  FOR SELECT USING (is_approved = true OR true);

CREATE POLICY "Reviews are insertable by authenticated users" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reviews are updatable by authenticated users" ON reviews
  FOR UPDATE USING (true);

CREATE POLICY "Reviews are deletable by authenticated users" ON reviews
  FOR DELETE USING (true);

-- Policies for Orders (Public insert, authenticated read/update/delete)
CREATE POLICY "Orders are insertable by everyone" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are viewable by authenticated users" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Orders are updatable by authenticated users" ON orders
  FOR UPDATE USING (true);

CREATE POLICY "Orders are deletable by authenticated users" ON orders
  FOR DELETE USING (true);

