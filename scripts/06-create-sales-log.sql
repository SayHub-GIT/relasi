-- Create sales_log table to track all laptop activities
CREATE TABLE IF NOT EXISTS sales_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laptop_id UUID REFERENCES laptops(id) ON DELETE CASCADE,
  laptop_name VARCHAR(255) NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  activity_type VARCHAR(20) NOT NULL CHECK (activity_type IN ('ADD', 'SOLD')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_log_activity ON sales_log(activity_type);
CREATE INDEX idx_sales_log_created_at ON sales_log(created_at);
CREATE INDEX idx_sales_log_laptop_id ON sales_log(laptop_id);

-- Enable RLS
ALTER TABLE sales_log ENABLE ROW LEVEL SECURITY;

-- Allow all operations (since we'll control access via admin UI)
CREATE POLICY "Sales log accessible to all" ON sales_log FOR SELECT USING (true);
CREATE POLICY "Sales log insert allowed" ON sales_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Sales log update allowed" ON sales_log FOR UPDATE USING (true);
CREATE POLICY "Sales log delete allowed" ON sales_log FOR DELETE USING (true);
