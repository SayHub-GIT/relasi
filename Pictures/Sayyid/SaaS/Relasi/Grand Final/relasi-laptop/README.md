# Relasi Store - Laptop Catalog & Management System

Website sistem katalog laptop dengan fitur admin CRUD lengkap dan user view-only access menggunakan Supabase dan Next.js.

## Fitur Utama

### Admin Features
- ✅ Full CRUD (Create, Read, Update, Delete) untuk katalog laptop
- ✅ Dashboard management dengan interface intuitif
- ✅ Akses terbatas ke admin saja dengan role-based authorization
- ✅ Penyimpanan permanen di Supabase PostgreSQL

### User Features
- ✅ Melihat katalog laptop lengkap
- ✅ Pencarian dan filter berdasarkan kategori
- ✅ Informasi produk detail (harga, stok, deskripsi)
- ✅ Akses read-only, tidak bisa mengubah data

### Authentication & Security
- ✅ Email/Password authentication dengan Supabase Auth
- ✅ Role-based access control (RBAC)
- ✅ Row-level security (RLS) di database
- ✅ Protected routes dengan middleware
- ✅ Automatic redirection berdasarkan role

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Type Safety**: TypeScript

## Setup & Installation

### 1. Database Setup

Pertama, jalankan SQL script untuk membuat tabel dan schema:

```bash
# Buka file scripts/01-init-database.sql dan jalankan melalui Supabase SQL Editor
# Atau gunakan Supabase CLI
```

### 2. Environment Variables

Tambahkan environment variables di Vercel project settings:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy ke Vercel

1. Push code ke GitHub
2. Hubungkan repository ke Vercel
3. Vercel akan otomatis detect Next.js dan deploy
4. Add environment variables di Vercel project settings

## User Roles

### Admin
- URL: `/admin`
- Akses: Full CRUD ke katalog produk
- Default: Tambahkan user dengan role `admin` di database

### Regular User
- URL: `/store`
- Akses: View-only katalog produk
- Default: Semua user baru otomatis mendapat role `user`

## Flow Aplikasi

```
Landing Page (/)
    ↓
    ├─→ Sign Up (email, password, nama)
    │      ↓
    │   Database: User dibuat dengan role 'user'
    │      ↓
    ├─→ Login (email, password)
         ├─→ Admin User → Admin Dashboard (/admin)
         │   - View semua produk
         │   - Add/Edit/Delete produk
         │
         └─→ Regular User → Store (/store)
             - View katalog
             - Search/Filter
             - Read-only access
```

## Database Schema

### products
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- price (DECIMAL)
- stock (INT)
- category (VARCHAR)
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)

### users
- id (UUID) - linked to auth.users
- email (VARCHAR)
- full_name (VARCHAR)
- role (VARCHAR) - 'admin' atau 'user'
- created_at, updated_at (TIMESTAMP)

### orders
- id (UUID)
- user_id (FK to users)
- product_id (FK to products)
- quantity (INT)
- total_price (DECIMAL)
- status (VARCHAR)
- created_at, updated_at (TIMESTAMP)

## Row-Level Security (RLS) Policies

- **Products**: Everyone can read, only admin can create/update/delete
- **Users**: Users dapat hanya melihat data mereka sendiri, admin melihat semua
- **Orders**: Users dapat hanya melihat order mereka sendiri, admin melihat semua

## Testing Checklist

- [ ] Sign up sebagai user baru → harus login otomatis
- [ ] Login sebagai user → redirect ke /store
- [ ] Login sebagai admin → redirect ke /admin
- [ ] Admin: Add product → muncul di database
- [ ] Admin: Edit product → perubahan tersimpan
- [ ] Admin: Delete product → product hilang
- [ ] User: View catalog → produk muncul dengan filter
- [ ] User: Logout → redirect ke /

## Troubleshooting

**Problem**: User tidak bisa login
- Solution: Periksa environment variables di Vercel

**Problem**: Admin akses ditolak
- Solution: Update user role di Supabase ke 'admin'

**Problem**: Produk tidak muncul
- Solution: Pastikan RLS policies sudah diatur di database

## Support

Jika ada masalah, buka Supabase dashboard atau check error logs di Vercel deployment.
