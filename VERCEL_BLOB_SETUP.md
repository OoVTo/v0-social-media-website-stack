# Setting Up Vercel Blob for Image Uploads

## Current Status
Image uploads are currently not working because the Vercel Blob token is not configured. You can still post text content, but images will not be uploaded.

## How to Fix It

### Option 1: Using Vercel (Recommended)
If your project is deployed on Vercel:

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Storage** → **Create Database**
4. Choose **Blob** storage
5. Click **Create** and follow the setup wizard
6. The `BLOB_READ_WRITE_TOKEN` will be automatically added to your environment variables

### Option 2: Manual Configuration (Local Development)
If you're developing locally:

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Vercel Blob token:
   ```
   NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=your_token_here
   ```
3. Get your token from [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)

4. Restart your development server

### Option 3: Without Image Upload (Text-Only Posts)
If you don't want to set up Vercel Blob right now:

- Users can still create and share text posts
- Media upload functionality is gracefully disabled
- Posts will be created successfully without images
- This is fully functional for text-based social media features

## How the Current System Works

The app now handles missing image uploads gracefully:

1. **If token is missing**: Shows a warning in the console, post is created without images
2. **If upload fails**: Logs the failure, post is still created with any successfully uploaded images
3. **Always allows posting**: Text content is never blocked by upload issues

## Image Upload Supported Formats

When image uploads are enabled:
- **Images**: JPEG, PNG, GIF, WebP, SVG, BMP
- **Videos**: MP4, WebM, OGG, MOV, AVI, MKV
- **Max file size**: Depends on your Vercel Blob plan (typically 200MB)

## Troubleshooting

### Error: "Image upload is not configured"
- Your `BLOB_READ_WRITE_TOKEN` is not set
- Solution: Follow Option 1 or 2 above

### Error: "Failed to upload file"
- Your token might be invalid or expired
- Solution: Regenerate your token in Vercel dashboard

### Images upload but don't show
- Check if the URL is accessible
- Verify Vercel Blob storage is active
- Check browser console for 404 errors

## Environment Variables

Your `.env.local` file should contain:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN=your_blob_token
```

## Commands to Test

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start
```

## More Information

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Documentation](https://supabase.com/docs)

## Note

The system is designed to gracefully degrade:
- ✅ Text posts always work
- ⚠️ Image uploads optional
- ✅ Likes, shares, and replies work without images
- ✅ Users can still post and share content

This means your social media platform is fully functional even without image uploads configured.
