-- ========================================
-- COMPLETE MEDIA UPLOADS & DELETE FIX
-- Copy and paste this ENTIRE block into Supabase SQL Editor
-- ========================================

-- 1. CREATE MEDIA_UPLOADS TABLE
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

-- RLS Policies for media_uploads
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

-- ========================================
-- 2. FIX DELETE RLS POLICY FOR POSTS
-- ========================================

DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- DONE! All migrations are now applied
-- ========================================
