-- Drop RLS from users table temporarily during registration
-- This allows the registration to work without complex RLS rules
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable but with simpler policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view any profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can create their own account" ON users;

-- Simple policy: anyone can read all user profiles
CREATE POLICY "Anyone can view user profiles"
  ON users
  FOR SELECT
  USING (true);

-- Users can update their own profile only
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can register"
  ON users
  FOR INSERT
  WITH CHECK (true);
