# Posting Feature Fix - Implementation Guide

## What Was Fixed

The posting feature wasn't working due to missing Row Level Security (RLS) policies in the Supabase database. Here are all the changes made:

### 1. **Updated RLS Policies** (`scripts/02-fix-rls-policies.sql`)
   - Added comprehensive RLS policies for the `posts` table that allow users to:
     - Create their own posts
     - Read all posts
     - Update/delete only their own posts
   - Added RLS policies for related tables (likes, follows, messages, stories, users)

### 2. **Enhanced Create Post Form** (`components/create-post-form.tsx`)
   - Added error state and error message display
   - Improved user authentication handling with `getUser()` function
   - Added validation for empty posts
   - Added better error messages for upload failures
   - Fixed media URLs handling (now accepts null when no media)
   - Added error feedback UI that displays to users

### 3. **New Migration Script** (`scripts/04-enable-posting.sql`)
   - Complete standalone SQL script with all necessary RLS policies
   - Can be run in Supabase SQL editor if policies weren't applied

## How to Enable Posting

### Step 1: Apply Database Policies

**Option A: Using Existing Scripts**
If you haven't run `scripts/02-fix-rls-policies.sql` yet, run it now in your Supabase SQL editor.

**Option B: Using New Script**
Run `scripts/04-enable-posting.sql` in your Supabase SQL editor to ensure all policies are in place.

### Step 2: Verify Configuration
Ensure your environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- Vercel Blob is configured for `BLOB_READ_WRITE_TOKEN` (for file uploads)

### Step 3: Test the Feature
1. Log in as a user
2. Go to "Create Post" page
3. Write some content
4. Optionally add images/videos
5. Click "Post" button

## How Posting Works Now

1. **User Validation**: Checks if user is logged in
2. **Content Validation**: Ensures post content is not empty
3. **Media Upload**: Uploads files to Vercel Blob if provided
4. **Post Creation**: Inserts post into Supabase database
5. **Error Handling**: Displays clear error messages if anything fails
6. **Redirect**: Takes user back to home after successful post

## Supported Media Types
- **Images**: jpeg, jpg, png, gif, webp, svg, bmp
- **Videos**: mp4, webm, ogg, mov, avi, mkv
- **Multiple files**: Users can upload multiple images/videos per post

## Error Messages Users Might See

- **"Please write something to post"** - User tried posting empty content
- **"You must be logged in to post"** - Session/authentication issue
- **"Failed to upload media"** - Vercel Blob upload failed
- **"Failed to create post. Please try again."** - Database insertion failed

## Database Schema

The `posts` table structure:
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Posts aren't saving
1. Check that RLS policies are enabled in Supabase
2. Verify user is properly logged in (check sessionStorage)
3. Check browser console for detailed error messages

### Media uploads failing
1. Verify Vercel Blob token is set correctly
2. Check file size limits
3. Ensure media type is supported

### RLS Policy errors
If you see "new row violates row-level security policy":
1. Run `scripts/04-enable-posting.sql` in Supabase SQL editor
2. Ensure the policies are created without errors
3. Verify `auth.uid()` matches the `user_id` in the posts table

## Next Steps

Consider implementing these enhancements:
- Real-time updates when new posts are created
- Post editing functionality
- Comment threads on posts
- Media carousel for multiple images
- Draft saving functionality
