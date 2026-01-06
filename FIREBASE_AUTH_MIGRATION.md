# Firebase Authentication Migration Guide

## What Changed

### Before (Supabase Auth)
- Authentication: Supabase Auth (email/password)
- Database: Supabase PostgreSQL
- User management: Supabase Auth + Supabase DB

### After (Firebase + Supabase Hybrid)
- Authentication: Firebase Authentication (email/password)
- Database: Supabase PostgreSQL (unchanged)
- User management: Firebase Auth + Supabase DB for roles/metadata

## Key Components Updated

1. **lib/firebase-client.ts** (NEW)
   - Firebase initialization untuk client-side
   - Export getFirebaseApp() dan getFirebaseAuth()

2. **lib/firebase-admin.ts** (NEW)
   - Firebase Admin SDK untuk server operations
   - Optional: gunakan untuk custom claims & token verification

3. **lib/sync-user-to-supabase.ts** (NEW)
   - syncUserToSupabase() - Create user record di Supabase setelah Firebase signup
   - getUserRole() - Fetch user role dari Supabase

4. **hooks/use-auth.ts** (UPDATED)
   - Ganti onAuthStateChange dari Supabase ke Firebase
   - Tetap fetch user role dari Supabase
   - Replace signOut() dengan Firebase signOut()

5. **components/auth-form.tsx** (UPDATED)
   - Replace supabase.auth.signUp() dengan Firebase createUserWithEmailAndPassword()
   - Replace supabase.auth.signInWithPassword() dengan Firebase signInWithEmailAndPassword()
   - Add API call ke /api/sync-user untuk sync ke Supabase

6. **app/api/sync-user/route.ts** (NEW)
   - POST endpoint untuk sync Firebase user ke Supabase
   - Create user record dengan default role 'user'

7. **app/api/get-user-role/route.ts** (NEW)
   - GET endpoint untuk fetch user role dari Supabase
   - Digunakan oleh useAuth hook

8. **middleware.ts** (UPDATED)
   - Change dari Supabase server client ke Firebase token verification
   - Tetap check admin role di Supabase

9. **package.json** (UPDATED)
   - Add: "firebase": "^10.7.2"
   - Add dev: "firebase-admin": "^12.0.0"
   - Remove: @supabase/ssr dependency (tetap ada untuk database)

10. **components/logout-button.tsx** (NEW)
    - Standalone button untuk logout
    - Menggunakan Firebase signOut()

## Setup Instructions

### Step 1: Firebase Admin User Creation
1. Go to https://console.firebase.google.com/
2. Select project: "relasicatalog"
3. Go to Authentication → Users tab
4. Click "Create user"
5. Email: admin@relasi.com
6. Password: admin123
7. Create

### Step 2: Sync Admin to Supabase
1. Go to Supabase SQL Editor
2. Run this SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@relasi.com';
```

### Step 3: Update Vercel Environment
Pastikan ada di Vercel project settings:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### Step 4: Test Flow

**Test 1 - New User Signup**
- Go to /auth/signup
- Email: testuser@example.com
- Password: Test123!
- Full Name: Test User
- Click Sign Up
- Should redirect to /auth/login
- Check Supabase: testuser@example.com should exist dengan role 'user'

**Test 2 - User Login**
- Go to /auth/login
- Email: testuser@example.com
- Password: Test123!
- Should redirect to /store
- Check /store - hanya bisa view katalog

**Test 3 - Admin Login**
- Go to /auth/login
- Email: admin@relasi.com
- Password: admin123
- Should redirect to /admin (atau stay di /store jika role belum di-update)
- Check Supabase role = 'admin'
- Go to /admin - bisa akses dashboard

## Troubleshooting

### "User not found" saat login
→ User perlu dibuat di Firebase Console terlebih dahulu

### User login tapi tidak bisa akses /store
→ Check Supabase: pastikan user ada di tabel users dengan role 'user'

### Admin login tapi akses /admin redirect ke /store
→ Check Supabase: pastikan role = 'admin'

### Firebase initialization error
→ Check console.log errors di browser developer tools
→ Pastikan firebaseConfig benar di lib/firebase-client.ts

## API Flow

```
User Sign Up
    ↓
createUserWithEmailAndPassword (Firebase)
    ↓
If success → POST /api/sync-user
    ↓
syncUserToSupabase (Supabase insert)
    ↓
Redirect to /auth/login

User Login
    ↓
signInWithEmailAndPassword (Firebase)
    ↓
If success → onAuthStateChanged triggers
    ↓
useAuth hook → Fetch role from /api/get-user-role
    ↓
Route guard checks role
    ↓
Redirect to appropriate dashboard
```

## Security Notes

1. Firebase handles password security & hashing
2. Supabase stores user metadata & roles
3. RLS policies on Supabase tables protect data
4. Firebase ID tokens are JWT tokens
5. Use HTTPS everywhere in production
6. Never expose Firebase private keys (API key is public, that's okay)
