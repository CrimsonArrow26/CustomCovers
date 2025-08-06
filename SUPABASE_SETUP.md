# Supabase Storage Setup Guide

## Setting up Image Uploads

To enable image uploads in the admin dashboard, you need to configure Supabase Storage:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set bucket name: `product-images`
5. Set privacy to **Public**
6. Click **Create bucket**

### 2. Configure RLS Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies:

#### Enable RLS on the bucket:
```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

#### Create policies for authenticated users:
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to product images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');
```

### 3. Alternative: Manual Setup via Dashboard

If you prefer using the Supabase Dashboard:

1. Go to **Storage** → **Policies**
2. Click **New Policy**
3. For each policy:
   - **Policy Name**: "Allow authenticated uploads"
   - **Target roles**: `authenticated`
   - **Policy definition**: `auth.role() = 'authenticated'`
   - **Operation**: INSERT, SELECT, UPDATE, DELETE as needed

### 4. Test the Setup

After setting up the storage bucket and policies:

1. Go to the Admin Dashboard in your app
2. Try uploading an image when adding a product
3. The image should upload successfully and display in the product list

### Troubleshooting

If you still get "Bucket not found" errors:

1. **Check bucket name**: Ensure the bucket is named exactly `product-images`
2. **Check permissions**: Verify RLS policies are correctly set
3. **Check authentication**: Ensure you're logged in as an admin user
4. **Check environment variables**: Verify your Supabase URL and key are correct

### Current Behavior

Until the storage bucket is set up:
- Image uploads will fail gracefully
- Products will be created with placeholder images
- You'll see helpful error messages guiding you to set up storage

The app will continue to work normally for all other features (products, orders, user management) even without storage configured. 