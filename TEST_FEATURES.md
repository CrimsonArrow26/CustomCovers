# 🧪 Quick Feature Test Guide

## **Before Testing - Run SQL Scripts**
1. Run `add_wishlist_and_stickers.sql` in Supabase SQL Editor
2. Run `add_cart_table.sql` in Supabase SQL Editor  
3. Run `disable_rls_for_cart_wishlist.sql` in Supabase SQL Editor

## **Test 1: Wishlist (Real-Time)**
1. **Sign in** to your account
2. **Go to products page** (`/products`)
3. **Click heart icon** on any product
   - ✅ Should show "Added to wishlist" toast
   - ✅ Header heart icon should show count (1)
4. **Click heart icon again**
   - ✅ Should show "Removed from wishlist" toast
   - ✅ Header count should update to 0
5. **Go to `/wishlist`**
   - ✅ Should show saved items (if any)

## **Test 2: Cart (Real-Time + Persistent)**
1. **Add item to cart** (click "Add" button)
   - ✅ Should show "Added to cart" toast
   - ✅ Header cart icon should show count
2. **Go to `/cart`**
   - ✅ Should show added items
3. **Update quantity** (use +/- buttons)
   - ✅ Should update immediately
4. **Sign out and sign back in**
   - ✅ Cart should still have items (persistent)

## **Test 3: Stickers (Real-Time)**
1. **Go to admin dashboard** (`/admin`)
2. **Select "Stickers" category**
3. **Add a sticker product**
   - ✅ Should appear in the catalog list
4. **Go to `/stickers`**
   - ✅ Should show sticker products
5. **Use filter on products page**
   - ✅ Select "Stickers" → Should filter correctly

## **Expected Real-Time Behavior**
- ✅ **Instant UI Updates**: Counts, toasts, page content
- ✅ **Database Sync**: Changes saved immediately
- ✅ **Cross-Session**: Data persists after logout/login
- ✅ **Cross-Device**: Data syncs across devices

## **If Features Don't Work**
- ❌ **Check Console**: Look for SQL errors
- ❌ **Verify SQL Scripts**: Ensure all 3 scripts were run
- ❌ **Check Authentication**: Make sure user is signed in
- ❌ **Check Network**: Look for failed API calls 