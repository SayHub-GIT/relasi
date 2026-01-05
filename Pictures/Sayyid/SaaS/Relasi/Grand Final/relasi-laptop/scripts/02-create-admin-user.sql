-- Script untuk setup admin user di Supabase
-- Pastikan user sudah dibuat di Firebase Console terlebih dahulu!

-- Update user dengan email admin@relasi.com menjadi admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@relasi.com';

-- Verifikasi
SELECT id, email, full_name, role FROM users WHERE email = 'admin@relasi.com';
