# Supabase Storage Setup Guide

## Overview
Your image upload system is already configured to store photos on **Supabase Storage**. This guide will help you set up the storage bucket properly.

## 🔧 Required Configuration

### 1. Environment Variables
Make sure your `.env.local` file contains:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Storage Bucket (optional - defaults to 'images')
NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET=images
```

### 2. Supabase Storage Bucket Setup

#### Step 1: Create Storage Bucket
1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Click **"New bucket"**
4. Set bucket name: `images`
5. Make it **Public** (so images can be accessed via URL)
6. Click **"Create bucket"**

#### Step 2: Set Bucket Policies
Create these RLS policies for the `images` bucket:

**Policy 1: Allow Public Read**
```sql
-- Allow anyone to view images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
```

**Policy 2: Allow Authenticated Upload**
```sql
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

**Policy 3: Allow Users to Delete Their Own Images**
```sql
-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Folder Structure
The system will automatically create this structure:
```
images/
├── posts/
│   └── [post-id]/
│       └── [timestamp-randomid].jpg
├── events/
│   └── [event-id]/
│       └── [timestamp-randomid].jpg
└── general/
    └── public/
        └── [timestamp-randomid].jpg
```

## 🚀 Current Implementation

### Upload Components:
- **`ImageUpload`**: For admin use (posts/events)
- **`PublicImageUpload`**: For public gallery uploads
- **API Route**: `/api/upload` for direct uploads

### Storage Features:
✅ **Automatic Upload**: Files uploaded directly to Supabase Storage
✅ **Public URLs**: Generated automatically for web access
✅ **File Validation**: Type, size, and format checking
✅ **Organized Storage**: Structured folder system
✅ **Unique Filenames**: Prevents conflicts with timestamp + random ID

## 🔒 Security Features

### File Validation:
- **Allowed Types**: JPEG, PNG, WebP, GIF only
- **Size Limit**: Maximum 5MB per file
- **Content Type**: Verified on upload

### Access Control:
- **Public Read**: Anyone can view uploaded images
- **Authenticated Upload**: Only logged-in users can upload
- **Organized Permissions**: Different access levels for different folders

## 🛠 Testing the Setup

### Test Upload:
1. Go to `/gallery` page
2. Try uploading an image
3. Check Supabase Storage dashboard to see the file
4. Verify the image displays correctly

### Admin Test:
1. Go to admin post/event creation
2. Upload an image
3. Verify it inserts into markdown content
4. Check storage for organized file structure

## 📋 Troubleshooting

### Common Issues:

**1. "Failed to upload file" Error:**
- Check if `images` bucket exists
- Verify bucket is public
- Ensure RLS policies are set correctly

**2. Images Not Displaying:**
- Check if bucket is public
- Verify public access policy exists
- Ensure CORS is configured in Supabase

**3. Permission Denied:**
- Check authentication status
- Verify upload policies for authenticated users
- Ensure user has proper permissions

### Environment Check:
Make sure these environment variables are set:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] `images` bucket created and public
- [ ] RLS policies configured
- [ ] Environment variables set
- [ ] Test upload successful
- [ ] Images display correctly
- [ ] Admin upload works
- [ ] Public gallery works

Your photos are now stored securely on Supabase Storage! 🎉
