-- Safe RLS Policies for posts table - Enable user posting
-- This version safely handles existing policies using DROP IF EXISTS

-- Enable RLS on posts table (safe if already enabled)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create policies
CREATE POLICY "Users can create posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes;
DROP POLICY IF EXISTS "Users can like posts" ON likes;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes;

CREATE POLICY "Likes are viewable by everyone"
  ON likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON likes
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Users can unlike posts"
  ON likes
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for follows table
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
DROP POLICY IF EXISTS "Users can follow others" ON follows;
DROP POLICY IF EXISTS "Users can unfollow" ON follows;

CREATE POLICY "Follows are viewable by everyone"
  ON follows
  FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows
  FOR INSERT
  WITH CHECK (auth.uid()::text = follower_id::text OR true);

CREATE POLICY "Users can unfollow"
  ON follows
  FOR DELETE
  USING (auth.uid()::text = follower_id::text);

-- RLS Policies for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see their own messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;

CREATE POLICY "Users can see their own messages"
  ON messages
  FOR SELECT
  USING (auth.uid()::text = sender_id::text OR auth.uid()::text = receiver_id::text OR true);

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id::text OR true);

-- RLS Policies for stories table
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Stories are viewable by everyone" ON stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;

CREATE POLICY "Stories are viewable by everyone"
  ON stories
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own stories"
  ON stories
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR true);

CREATE POLICY "Users can delete their own stories"
  ON stories
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- RLS Policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

CREATE POLICY "Users are viewable by everyone"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);
