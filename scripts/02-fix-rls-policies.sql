-- Add INSERT policy for users table to allow registration
-- This policy allows anyone (including unauthenticated users) to insert a new row into the users table
CREATE POLICY "Users can create their own account"
  ON users
  FOR INSERT
  WITH CHECK (true);
