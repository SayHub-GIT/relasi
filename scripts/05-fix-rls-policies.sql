-- Fix RLS policies to allow INSERT and UPDATE operations
ALTER TABLE laptops DISABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Laptops visible to all" ON laptops;

-- Create new policies with full CRUD access
-- Anyone can view laptops
CREATE POLICY "Laptops visible to all" ON laptops FOR SELECT USING (true);

-- Anyone can insert laptops (admin will be added in Supabase UI later)
CREATE POLICY "Anyone can insert laptops" ON laptops FOR INSERT WITH CHECK (true);

-- Anyone can update laptops (admin will be added in Supabase UI later)
CREATE POLICY "Anyone can update laptops" ON laptops FOR UPDATE USING (true) WITH CHECK (true);

-- Anyone can delete laptops (admin will be added in Supabase UI later)
CREATE POLICY "Anyone can delete laptops" ON laptops FOR DELETE USING (true);

-- Re-enable RLS
ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
