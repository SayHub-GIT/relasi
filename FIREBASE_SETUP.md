# Firebase Authentication Setup

## Overview
Aplikasi ini menggunakan **Firebase Authentication** untuk login/signup dan **Supabase** untuk database.

## Akun Admin Default
- Email: `admin@relasi.com`
- Password: `admin123`

## Langkah Setup

### 1. Firebase Configuration
Firebase sudah dikonfigurasi di `lib/firebase-client.ts` dengan project ID: `relasicatalog`

### 2. Create Admin User in Firebase
Di Firebase Console:
1. Go to Authentication → Users
2. Create new user dengan email `admin@relasi.com` dan password `admin123`

### 3. Sync Admin to Supabase
Jalankan SQL di Supabase SQL Editor:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@relasi.com';
```

Atau jika user belum ada di Supabase, insert terlebih dahulu:
```sql
INSERT INTO users (id, email, full_name, role)
VALUES ('FIREBASE_UID_DARI_ADMIN', 'admin@relasi.com', 'Admin Relasi', 'admin');
```

### 4. Environment Variables Needed
Pastikan ada di Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (untuk server operations)

### 5. Test Authentication Flow

**Sign Up:**
- Go to `/auth/signup`
- Buat account baru
- User akan auto-synced ke Supabase dengan role 'user'

**Login:**
- Go to `/auth/login`
- Login dengan email dan password
- Firebase akan authenticate, lalu fetch role dari Supabase

**Admin Access:**
- Login dengan `admin@relasi.com` / `admin123`
- Akses `/admin` untuk dashboard

**User Access:**
- Login dengan user biasa
- Akses `/store` untuk lihat katalog

## Architecture

```
Firebase Authentication → Firebase stores user credentials
                      ↓
            User logins successfully
                      ↓
         Fetch user role from Supabase
                      ↓
Route protection based on role (admin/user)
```

## File Structure

- `lib/firebase-client.ts` - Firebase initialization (client-side)
- `lib/firebase-admin.ts` - Firebase Admin SDK (server-side)
- `lib/sync-user-to-supabase.ts` - Sync user from Firebase to Supabase
- `hooks/use-auth.ts` - React hook untuk auth state (Firebase)
- `components/auth-form.tsx` - Login/Signup form (Firebase)
- `app/api/sync-user/route.ts` - API untuk sync Firebase user ke Supabase
- `app/api/get-user-role/route.ts` - API untuk fetch user role dari Supabase
- `middleware.ts` - Route protection dengan Firebase token

## Troubleshooting

### User tidak bisa login
- Pastikan user sudah dibuat di Firebase Console
- Pastikan user sudah di-sync ke Supabase

### Admin tidak bisa akses `/admin`
- Pastikan role di Supabase adalah 'admin'
- Cek di Firebase Console bahwa user terautentikasi

### Token expired
- Firebase token valid 1 jam, akan auto-refresh saat membuat request baru
