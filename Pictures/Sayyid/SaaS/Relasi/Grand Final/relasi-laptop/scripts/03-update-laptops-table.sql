-- Creating new laptops table with correct schema for Relasi Store
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE laptops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15, 2) NOT NULL,
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('new', 'second')),
  year INTEGER,
  specs JSONB DEFAULT '{}'::jsonb,
  image_url TEXT,
  is_sold_out BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_laptops_condition ON laptops(condition);
CREATE INDEX idx_laptops_created_at ON laptops(created_at);
CREATE INDEX idx_laptops_is_sold_out ON laptops(is_sold_out);

-- Enable RLS
ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Laptops visible to all" ON laptops FOR SELECT USING (true);
