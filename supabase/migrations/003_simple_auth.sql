-- ============================================
-- BRUTSTeamPad — Simple Auth Migration
-- No verification, just email + mobile login
-- ============================================

-- Remove auth.users FK constraint from profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE;
ALTER TABLE profiles ADD PRIMARY KEY (id);
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add mobile number column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Make email unique for login lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);

-- Drop auth trigger (no longer needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Update RLS: allow public insert for login (service_role handles it)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "Service role manages profiles"
  ON profiles FOR ALL USING (auth.role() = 'service_role');
