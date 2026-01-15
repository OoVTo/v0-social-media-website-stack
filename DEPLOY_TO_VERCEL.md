# Deploy to Vercel & Set Up Blob Storage - Step-by-Step Guide

## Step 1: Prepare Your GitHub Repository

Your project is already committed to GitHub at: `https://github.com/OoVTo/v0-social-media-website-stack`

Make sure everything is pushed:
```bash
git status
git push origin main
```

## Step 2: Sign Up / Log In to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You'll be taken to the Vercel dashboard

## Step 3: Import Your Project

1. In the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Under "Import Git Repository", find your repository:
   - Search for `v0-social-media-website-stack`
   - Click it to select
3. Click **"Import"**

## Step 4: Configure Environment Variables

Before deploying, add your Supabase environment variables:

1. You'll see the "Configure Project" step
2. Click **"Environment Variables"**
3. Add these variables (get values from your Supabase project):
   ```
   NEXT_PUBLIC_SUPABASE_URL = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
   ```
4. Click **"Add"** for each variable
5. Click **"Deploy"**

The project will now build and deploy (takes 2-3 minutes)

## Step 5: Set Up Vercel Blob Storage

Once deployment is complete:

1. Go to your Vercel project dashboard
2. Click **"Settings"** (top navigation)
3. Click **"Storage"** (left sidebar)
4. Click **"Create Database"** or **"Browse Store"**
5. Select **"Blob"** from the storage options
6. Click **"Create"**
7. Name it something like `social-media-images`
8. Click **"Create"**
9. You'll see a confirmation with your token

## Step 6: Add Blob Token to Environment

The token should be automatically added to your environment variables. To verify:

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Look for `BLOB_READ_WRITE_TOKEN` - it should be there
3. If not, you can manually add it:
   - Copy your token from the Blob storage page
   - Add it as an environment variable named `BLOB_READ_WRITE_TOKEN`

## Step 7: Redeploy

1. Go to **Deployments** tab
2. Click the three dots (**...**) on your latest deployment
3. Select **"Redeploy"**
4. Wait for it to build and deploy (1-2 minutes)

## Step 8: Test Your Deployment

1. Visit your Vercel deployment URL (something like `https://v0-social-media-website-stack.vercel.app`)
2. Log in with a test account
3. Try creating a text post (should work)
4. Try uploading an image with a post (should now work!)

## Your URLs

After deployment, you'll have:

- **App URL**: `https://v0-social-media-website-stack.vercel.app` (or custom domain)
- **Vercel Dashboard**: `https://vercel.com/dashboard`
- **Blob Storage**: Automatically configured in your project

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Make sure your Supabase credentials are valid
- Check the build logs in Vercel for specific errors

### Images Still Don't Upload
- Verify `BLOB_READ_WRITE_TOKEN` is in environment variables
- Redeploy after adding the token
- Check browser console for errors

### Can't Find GitHub Repo
- Make sure you're logged in with the GitHub account that owns the repo
- Verify the repo is public or that you've given Vercel access

## Environment Variables Checklist

After setup, verify you have:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `BLOB_READ_WRITE_TOKEN`

## Next Steps

Once deployed:
1. Share your app URL with others
2. Users can sign up and start posting
3. Test all features: posts, likes, shares, replies
4. Monitor usage in Vercel dashboard

## Useful Commands

If you need to push changes:
```bash
git add .
git commit -m "your message"
git push origin main
```

Vercel will automatically redeploy when you push to main!

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Project GitHub](https://github.com/OoVTo/v0-social-media-website-stack)

## Important Notes

- **Free Tier**: Vercel's free tier includes:
  - Unlimited deployments
  - Up to 3 Blob storage instances
  - 1000 requests/month for Blob storage
  
- **Production Ready**: Your app is now production-ready and accessible to anyone with the URL

- **Auto-Redeploy**: Every time you push to GitHub, Vercel automatically rebuilds and deploys

Congratulations! Your social media platform is now live! 🚀
