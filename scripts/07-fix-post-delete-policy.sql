-- Fix DELETE RLS policy for posts table
-- Drop the old DELETE policy if it exists
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;

-- Create a new DELETE policy that allows users to delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Verify the policy is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
