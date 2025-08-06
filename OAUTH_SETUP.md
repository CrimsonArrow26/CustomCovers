# 🔐 OAuth Setup Guide for CustomCovers

## 📋 **Supabase OAuth Configuration**

### **Step 1: Enable Google OAuth in Supabase**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click **Enable**
4. Add your Google OAuth credentials (Client ID & Secret)

### **Step 2: Configure Redirect URLs**

#### **For Local Development:**
```
http://localhost:5173/auth/callback
```

#### **For Production (add when you deploy):**
```
https://your-domain.com/auth/callback
https://your-app.vercel.app/auth/callback
https://your-app.netlify.app/auth/callback
```

### **Step 3: Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set **Application Type** to **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```

### **Step 4: Environment Variables**

Make sure your `.env.local` has:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔄 **How It Works**

1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects back to Supabase
4. Supabase redirects to your app at `/auth/callback`
5. Your `AuthCallbackPage` handles the final authentication

## 🚨 **Common Issues**

- **"Invalid redirect URI"**: Check that your redirect URL exactly matches what's in Supabase
- **"OAuth provider not configured"**: Make sure Google OAuth is enabled in Supabase
- **"Client ID not found"**: Verify your Google OAuth credentials are correct

## 📞 **Need Help?**

If you encounter issues:
1. Check browser console for errors
2. Verify all URLs match exactly
3. Ensure Google OAuth is properly configured
4. Test with a fresh browser session 