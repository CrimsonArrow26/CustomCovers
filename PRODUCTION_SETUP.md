# 🚀 Production Setup Guide for CustomCovers

## ✅ **Overview**

This guide will help you set up CustomCovers for production with proper authentication, email verification, and Google OAuth integration.

## 🔧 **Supabase Configuration**

### **1. Enable Email Authentication**

1. **Go to Supabase Dashboard** → Your Project → Authentication → Settings
2. **Enable Email Auth**:
   - ✅ Enable "Enable email confirmations"
   - ✅ Enable "Enable email change confirmations"
   - ✅ Enable "Enable secure email change"
3. **Configure Email Templates**:
   - Go to Authentication → Email Templates
   - Customize "Confirm signup" template
   - Customize "Reset password" template

### **2. Enable Google OAuth**

1. **Go to Supabase Dashboard** → Authentication → Providers
2. **Enable Google Provider**:
   - ✅ Enable Google
   - Add your Google OAuth credentials:
     - **Client ID**: From Google Cloud Console
     - **Client Secret**: From Google Cloud Console
   - **Redirect URL**: `https://your-domain.com/auth/callback`

### **3. Google Cloud Console Setup**

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**:
   - Go to APIs & Services → Library
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - **Authorized redirect URIs**:
     - `https://your-domain.com/auth/callback`
     - `http://localhost:5173/auth/callback` (for development)

4. **Copy Credentials**:
   - Copy Client ID and Client Secret
   - Add them to Supabase Google provider settings

### **4. Database Setup**

Run these SQL scripts in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin' OR email = 'Parkarsabira9@gmail.com'
  ));

CREATE POLICY "Users can manage own cart" ON cart
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin' OR email = 'Parkarsabira9@gmail.com'
  ));

CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);
```

### **5. Storage Setup**

1. **Create Storage Bucket**:
   - Go to Storage → Create bucket
   - Name: `product-images`
   - Public bucket: ✅ Yes

2. **Storage Policies**:
   ```sql
   -- Allow authenticated users to upload images
   CREATE POLICY "Authenticated users can upload images" ON storage.objects
     FOR INSERT WITH CHECK (
       bucket_id = 'product-images' AND auth.role() = 'authenticated'
     );

   -- Allow public access to view images
   CREATE POLICY "Public access to images" ON storage.objects
     FOR SELECT USING (bucket_id = 'product-images');
   ```

## 🌐 **Environment Variables**

### **Development (.env.local)**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Production**
Set these environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_SERVICE_ROLE_KEY`

## 🚀 **Deployment**

### **Option 1: Vercel (Recommended)**

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - Add all environment variables in Vercel dashboard

3. **Deploy**:
   - Vercel will automatically deploy on push to main branch

### **Option 2: Netlify**

1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - Import your GitHub repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**:
   - Add all environment variables in Netlify dashboard

### **Option 3: GitHub Pages**

1. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   ```

2. **Deploy Script**:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

## 🔐 **Admin Account Setup**

### **Create Admin User**

1. **Sign up with admin email**:
   - Use `Parkarsabira9@gmail.com` to sign up
   - Verify email

2. **Update user role**:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'Parkarsabira9@gmail.com';
   ```

3. **Set admin password**:
   - Go to Authentication → Users
   - Find your admin user
   - Click "Set password" or use password reset

## 📧 **Email Configuration**

### **Custom SMTP (Optional)**

1. **Go to Supabase Dashboard** → Settings → Auth
2. **Configure SMTP**:
   - SMTP Host: Your email provider
   - SMTP Port: 587 or 465
   - Username: Your email
   - Password: App password
   - Sender Name: CustomCovers
   - Sender Email: your-email@domain.com

## 🔒 **Security Checklist**

- ✅ Email verification enabled
- ✅ Google OAuth configured
- ✅ RLS policies implemented
- ✅ Storage policies configured
- ✅ Environment variables secured
- ✅ Admin account created
- ✅ HTTPS enabled (automatic with Vercel/Netlify)

## 🧪 **Testing Production**

### **1. Test Authentication**
- ✅ Sign up with new email
- ✅ Verify email
- ✅ Sign in with email/password
- ✅ Sign in with Google
- ✅ Change password
- ✅ Sign out

### **2. Test Admin Features**
- ✅ Admin dashboard access
- ✅ Product management
- ✅ Order management
- ✅ User management

### **3. Test User Features**
- ✅ Browse products
- ✅ Add to cart
- ✅ Add to wishlist
- ✅ Checkout process
- ✅ Order history

## 🚨 **Important Notes**

### **Admin Account**
- **Email**: `Parkarsabira9@gmail.com`
- **Password**: Set during signup or reset
- **Role**: Automatically set to 'admin'

### **Demo Accounts Removed**
- No more demo accounts
- All users must sign up with real emails
- Email verification required

### **Google OAuth**
- Users can sign in/up with Google
- Automatic account creation
- No password required for Google users

## 📞 **Support**

If you encounter issues:

1. **Check Supabase Logs**: Dashboard → Logs
2. **Check Browser Console**: For client-side errors
3. **Verify Environment Variables**: All required vars set
4. **Test Authentication**: Supabase Dashboard → Authentication

## 🎉 **Production Ready!**

Your CustomCovers application is now production-ready with:
- ✅ Real authentication
- ✅ Email verification
- ✅ Google OAuth
- ✅ Secure RLS policies
- ✅ Admin functionality
- ✅ Professional deployment

**Next Steps**:
1. Deploy to your chosen platform
2. Test all functionality
3. Add your domain
4. Configure custom email templates
5. Monitor usage and performance 