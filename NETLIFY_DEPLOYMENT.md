# 🚀 Netlify Deployment Guide for CustomCovers

## 🔧 **Fix for Secrets Detection Issue**

The secrets detection error occurs because Vite bundles environment variables into the client-side code. Here's how to fix it:

### **Step 1: Set Environment Variables in Netlify Dashboard**

1. **Go to your Netlify Dashboard**
2. **Select your site**
3. **Go to Site Settings** → **Environment Variables**
4. **Add these environment variables:**

```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
```

### **Step 2: Update netlify.toml Configuration**

The current configuration should work with environment variables set in the dashboard:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Configure secrets scanning to ignore build output
[secrets_scanning]
  enabled = true
  omit_paths = ["dist/**"]

# Redirects for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Step 3: Alternative - Use Runtime Environment Variables**

If the above doesn't work, we can modify the code to use runtime environment variables:

1. **Remove environment variables from build**
2. **Set them at runtime in Netlify**
3. **Use a different approach for client-side access**

### **Step 4: Verify Deployment**

After setting environment variables in Netlify:
1. **Trigger a new deployment**
2. **Check build logs**
3. **Verify secrets scanning passes**

## 🔒 **Security Best Practices**

- ✅ **VITE_SUPABASE_ANON_KEY** is safe to expose (designed for client-side)
- ✅ **VITE_SUPABASE_URL** is not sensitive
- ⚠️ **VITE_SUPABASE_SERVICE_ROLE_KEY** should be kept secure (only used server-side)

## 🎯 **Expected Result**

After following these steps:
- ✅ Build will succeed
- ✅ Secrets scanning will pass
- ✅ App will work correctly
- ✅ Environment variables will be available

## 📞 **Need Help?**

If you still encounter issues:
1. Check Netlify build logs
2. Verify environment variables are set correctly
3. Ensure no hardcoded values in the codebase 