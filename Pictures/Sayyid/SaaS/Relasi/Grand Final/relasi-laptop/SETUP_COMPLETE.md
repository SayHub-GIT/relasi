# Relasi Store - Laptop Catalog System

## Overview
A professional laptop catalog application with:
- **Public Catalog**: Accessible immediately upon load, searchable & filterable
- **Admin Panel**: Modal-based login with full CRUD capabilities for products
- **Database**: Supabase PostgreSQL for persistent storage
- **Design**: Professional sage green aesthetic

## Key Features

### User Experience
1. Website loads → Directly shows **Laptop Catalog**
2. Search and filter by category (Laptop, Gaming, Ultrabook, Budget)
3. View product details: price, stock, images
4. **Sold Out** badge appears on out-of-stock items

### Admin Access
1. Click "Admin Access" button (visible to non-admins) or "Manage Products" (visible when logged in)
2. Modal opens for login
3. Enter credentials:
   - **Email**: admin@relasi.com
   - **Password**: admin123
4. Access full CRUD:
   - **Create**: Add new laptop products
   - **Read**: View all products with full details
   - **Update**: Edit existing product information
   - **Delete**: Remove products from catalog

### Product Data Fields
- Name
- Description
- Price
- Stock (quantity available)
- Category
- Image URL
- Auto-generated: ID, Created/Updated timestamps
- Status: "Sold Out" (auto-calculated from stock = 0)

## Technical Stack
- **Frontend**: Next.js 16 with React
- **Authentication**: Static credentials (session-based)
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS with sage green theme

## Credentials
- Admin Email: `admin@relasi.com`
- Admin Password: `admin123`

## Session Management
- Admin login stored in sessionStorage
- Persists during browser session
- Clears on logout or tab close
