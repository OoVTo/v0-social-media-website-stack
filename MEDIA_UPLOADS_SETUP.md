# Media Upload & Delete Fix - Setup Instructions

## Overview
This update implements proper media uploads with a dedicated `media_uploads` table in Supabase and fixes the delete functionality.

## What's Changed

### Code Updates (Already Committed)
✅ **create-post-form.tsx** - Now uploads media to Blob storage and records in media_uploads table
✅ **post-card.tsx** - Fetches and displays media from media_uploads table with proper controls
✅ **storage-utils.ts** - Handles file uploads to Vercel Blob storage
✅ **SQL Migrations** - Scripts created but need manual execution in Supabase

### SQL Migrations Required
You MUST run these in Supabase for the feature to work:

#### 1. Create media_uploads Table
Run this SQL in Supabase SQL Editor:

```sql
-- Create media uploads table to store image and video uploads
CREATE TABLE IF NOT EXISTS media_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_media_uploads_post_id ON media_uploads(post_id);
CREATE INDEX idx_media_uploads_user_id ON media_uploads(user_id);
CREATE INDEX idx_media_uploads_created_at ON media_uploads(created_at);

-- Enable RLS
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view media uploads"
  ON media_uploads FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own media"
  ON media_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON media_uploads FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON media_uploads FOR UPDATE
  USING (auth.uid() = user_id);
```

#### 2. Fix Delete RLS Policy
Run this SQL in Supabase SQL Editor:

```sql
-- Fix DELETE RLS policy for posts table
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
```

## Setup Steps

### Step 1: Run SQL Migrations in Supabase
1. Go to https://app.supabase.com/
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the first SQL block above (media_uploads table)
6. Click **Run**
7. Create another new query
8. Paste the second SQL block (delete policy fix)
9. Click **Run**

### Step 2: Deploy on Vercel
1. Go to your Vercel project
2. Deployments tab
3. Click **Redeploy** on the latest commit
4. Wait for build to complete

### Step 3: Test the Feature
1. Visit your app URL
2. Create a post with text
3. Click the image/video button
4. Select an image or video file
5. Preview should appear
6. Click Post
7. Media should appear below the post in the feed
8. Try deleting the post - should work now

## Files Modified
- `components/create-post-form.tsx` - Media upload integration
- `components/post-card.tsx` - Media display and delete fix
- `scripts/06-add-media-uploads-table.sql` - Media table creation
- `scripts/07-fix-post-delete-policy.sql` - Delete policy fix

## Troubleshooting

### Media uploads fail with "Blob token not found"
- Verify Vercel Blob storage is set up
- Check `BLOB_READ_WRITE_TOKEN` in Vercel Environment Variables
- Redeploy after adding token

### Media doesn't display in posts
- Verify media_uploads table exists in Supabase
- Check browser console for errors
- Ensure file uploaded successfully (check Vercel Blob dashboard)

### Delete button doesn't work
- Verify you ran the second SQL migration
- Check browser console for error details
- Try refreshing the page

### Media uploads but database insert fails
- Check RLS policies on media_uploads table
- Verify user is logged in
- Check Supabase database logs

## Next Steps
1. Run the SQL migrations in Supabase immediately
2. Redeploy on Vercel
3. Test the media upload and delete features
4. Report any remaining issues

All code changes are ready - only the database setup is needed!
