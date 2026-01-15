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

-- RLS Policy: Users can view all media uploads
CREATE POLICY "Anyone can view media uploads"
  ON media_uploads FOR SELECT
  USING (true);

-- RLS Policy: Users can insert their own media uploads
CREATE POLICY "Users can insert their own media"
  ON media_uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own media uploads
CREATE POLICY "Users can delete their own media"
  ON media_uploads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own media uploads
CREATE POLICY "Users can update their own media"
  ON media_uploads FOR UPDATE
  USING (auth.uid() = user_id);
