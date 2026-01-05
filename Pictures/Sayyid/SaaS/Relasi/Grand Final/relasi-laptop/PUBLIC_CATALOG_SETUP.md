# Relasi Store - Public Catalog + Admin Login Architecture

## System Overview

This is a hybrid authentication system where:
- **Public Users**: Browse catalog without authentication
- **Admin Users**: Must authenticate with Firebase before accessing admin panel

## Architecture

### Routes
- `/` - Home page with login and catalog access
- `/store` - **PUBLIC** catalog (no auth required)
- `/auth/login` - Admin login page (Firebase)
- `/admin` - **PROTECTED** admin dashboard (Firebase + Supabase role check)

### Authentication Flow

#### Public User Access
```
User → Home → Click "View Catalog" → /store (PUBLIC)
       ↓
     Browse products (no authentication needed)
```

#### Admin Access
```
Admin → Home → Click "Admin Login" → /auth/login
        ↓
      Firebase Authentication (admin@relasi.com / admin123)
        ↓
      Verify admin role in Supabase
        ↓
      Redirect to /admin dashboard
```

## Key Technologies

- **Firebase**: Authentication (admin login only)
- **Supabase PostgreSQL**: Database & role management
- **Middleware**: Protects `/admin` routes only

## Setup Instructions

### 1. Firebase Setup
Admin account already created:
- Email: `admin@relasi.com`
- Password: `admin123`

### 2. Supabase Setup
Ensure admin role in users table:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@relasi.com';
```

### 3. Testing Flow

**Test Public Catalog:**
1. Go to `/` home page
2. Click "View Catalog"
3. Browse `/store` without authentication

**Test Admin Access:**
1. Go to `/` home page
2. Click "Admin Login"
3. Enter credentials: admin@relasi.com / admin123
4. Access `/admin` dashboard with full CRUD

### 4. Cookies & Session
- `firebaseUid`: Stores Firebase user ID
- `authToken`: Stores Firebase ID token
- Middleware validates tokens for `/admin` routes

## File Structure Changes

### Removed/Simplified
- ❌ `/auth/signup` page (admin only system)
- ❌ User registration flow
- ✂️ Simplified `middleware.ts` (only protects `/admin`)

### Created/Updated
- ✅ `/auth/login` → `/auth/admin-login`
- ✅ `components/admin-auth-form.tsx` - Firebase admin login
- ✅ `app/store/page.tsx` - Public catalog (no auth check)
- ✅ `components/admin-header.tsx` - Firebase logout
- ✅ `middleware.ts` - Simplified to protect only `/admin`

## Important Notes

1. **Store is Completely Public** - No authentication required to view catalog
2. **Admin Route Protected** - Middleware checks Firebase token + Supabase admin role
3. **No User Accounts** - Only admin accounts exist
4. **One Admin User** - admin@relasi.com has full control

## Troubleshooting

### "Only admin accounts can login here"
- Verify email is admin@relasi.com
- Check Supabase users table: role should be 'admin'

### Admin redirect loops
- Check middleware.ts is protecting only `/admin`
- Verify `firebaseUid` cookie is set after login

### Store not loading products
- Check Supabase connection
- Verify products table exists and has data
