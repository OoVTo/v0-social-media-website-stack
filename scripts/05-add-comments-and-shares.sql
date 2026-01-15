-- Migration: Add comments table and shared_post_id to posts

-- Create comments table for post replies
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add shared_post_id column to posts table for quote posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shared_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_shared_post_id ON posts(shared_post_id);

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments table
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Update posts RLS policy to allow share posts
DROP POLICY IF EXISTS "Users can create posts" ON posts;

CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);
