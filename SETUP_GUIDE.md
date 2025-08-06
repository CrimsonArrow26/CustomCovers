# 🚀 Setup Guide for Wishlist and Persistent Cart

## 📋 **Required Database Setup**

### **Step 1: Run SQL Scripts**

Run these SQL scripts in your Supabase SQL Editor in order:

#### **1. Add Wishlist and Stickers**
```sql
-- Run add_wishlist_and_stickers.sql
-- This creates the wishlist table and adds stickers category
```

#### **2. Add Cart Table**
```sql
-- Run add_cart_table.sql
-- This creates the cart table for persistent cart functionality
```

#### **3. Disable RLS (Recommended)**
```sql
-- Run disable_rls_for_cart_wishlist.sql
-- This disables RLS on cart and wishlist tables for custom auth
```

## 🎯 **Features Implemented**

### ✅ **Wishlist Feature**
- **Add to Wishlist**: Click heart icon on product cards
- **Remove from Wishlist**: Click filled heart icon
- **View Wishlist**: Click heart icon in header (shows count)
- **Persistent Storage**: Wishlist saved to database per user

### ✅ **Stickers Section**
- **New Category**: Added 'sticker' to product categories
- **Navigation**: Replaced phones with stickers in header/footer
- **Admin Dashboard**: Can add sticker products
- **Filtering**: Stickers appear in product filters

### ✅ **Persistent Cart & Wishlist**
- **Database Storage**: Cart and wishlist saved to database
- **Cross-Device Sync**: Data persists across devices
- **Fallback**: Uses localStorage for non-authenticated users
- **Auto-Sync**: Automatically loads user's cart/wishlist on login

## 🔧 **How to Test**

### **1. Test Wishlist**
1. Sign in to your account
2. Go to products page
3. Click heart icon on any product
4. Check header - should show wishlist count
5. Go to `/wishlist` to view saved items
6. Click filled heart to remove items

### **2. Test Stickers**
1. Go to admin dashboard
2. Select "Stickers" category
3. Add some sticker products
4. Go to `/stickers` or use filter to view

### **3. Test Persistent Cart**
1. Add items to cart while signed out
2. Sign in - cart should persist
3. Add more items while signed in
4. Sign out and back in - cart should still be there

## 🐛 **Troubleshooting**

### **Error: "Could not find the table 'public.wishlist'"**
- **Solution**: Run the `add_wishlist_and_stickers.sql` script in Supabase SQL Editor

### **Error: "Could not find the table 'public.cart'"**
- **Solution**: Run the `add_cart_table.sql` script in Supabase SQL Editor

### **Error: "new row violates row-level security policy"**
- **Solution**: Run the `disable_rls_for_cart_wishlist.sql` script in Supabase SQL Editor

### **Cart/Wishlist not syncing**
- **Check**: Ensure user is authenticated
- **Check**: Verify RLS policies are applied
- **Check**: Check browser console for errors

## 📁 **Files Modified**

### **New Files:**
- `src/contexts/WishlistContext.tsx` - Wishlist state management
- `src/pages/WishlistPage.tsx` - Wishlist page
- `add_wishlist_and_stickers.sql` - Database schema
- `add_cart_table.sql` - Cart table schema
- `disable_rls_for_cart_wishlist.sql` - RLS disable script

### **Modified Files:**
- `src/App.tsx` - Added WishlistProvider and routes
- `src/contexts/CartContext.tsx` - Added persistent cart
- `src/components/products/ProductCard.tsx` - Added wishlist toggle
- `src/components/layout/Header.tsx` - Added wishlist icon with count
- `src/pages/admin/AdminDashboard.tsx` - Added stickers category
- `src/pages/ProductsPage.tsx` - Added stickers filter
- `src/lib/supabase.ts` - Added new interfaces

## 🎉 **Ready to Use!**

After running the SQL scripts, all features should work:
- ✅ Wishlist functionality
- ✅ Stickers category
- ✅ Persistent cart and wishlist
- ✅ Cross-device synchronization 