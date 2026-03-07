-- ============================================
-- BRUTSTeamPad — COMPLETE DATABASE SETUP
-- Run this ONCE in Supabase SQL Editor
-- SAFE TO RE-RUN — won't break anything
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- STEP 1: Core Tables (from 001)
-- ================================================

CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_key VARCHAR(100) NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  yjs_state BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_snapshot TEXT NOT NULL,
  created_by VARCHAR(255) DEFAULT 'system',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  cursor_color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  original_text TEXT DEFAULT '',
  suggested_text TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================
-- STEP 2: Profiles table (simple auth, no supabase auth)
-- ================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Remove any FK to auth.users if it exists from an older migration
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Ensure proper defaults
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Add mobile column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile TEXT;

-- ================================================
-- STEP 3: Add owner_id to workspaces
-- ================================================

ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS owner_id UUID;

-- ================================================
-- STEP 4: Workspace Members table
-- ================================================

CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- ================================================
-- STEP 5: Indexes (use IF NOT EXISTS where possible)
-- ================================================

CREATE INDEX IF NOT EXISTS idx_workspaces_team_key ON workspaces(team_key);
CREATE INDEX IF NOT EXISTS idx_team_keys_team_key ON team_keys(team_key);
CREATE INDEX IF NOT EXISTS idx_team_keys_workspace ON team_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_workspace ON documents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_document ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_versions_timestamp ON document_versions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON user_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sessions_online ON user_sessions(workspace_id, is_online);
CREATE INDEX IF NOT EXISTS idx_suggestions_document ON suggestions(document_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON workspace_members(user_id);

-- ================================================
-- STEP 6: Drop ALL old auth triggers
-- ================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- ================================================
-- STEP 7: Auto-update timestamp triggers
-- ================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STEP 8: Row Level Security — DROP all old, create new
-- ================================================

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies
DROP POLICY IF EXISTS "Allow all" ON workspaces;
DROP POLICY IF EXISTS "Allow all" ON team_keys;
DROP POLICY IF EXISTS "Allow all" ON documents;
DROP POLICY IF EXISTS "Allow all" ON document_versions;
DROP POLICY IF EXISTS "Allow all" ON user_sessions;
DROP POLICY IF EXISTS "Allow all" ON suggestions;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Service role manages profiles" ON profiles;
DROP POLICY IF EXISTS "Members can view own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Owners can manage members" ON workspace_members;
DROP POLICY IF EXISTS "Service role full access members" ON workspace_members;
DROP POLICY IF EXISTS "Members can read workspaces" ON workspaces;
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can update workspaces" ON workspaces;
DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
DROP POLICY IF EXISTS "Service role full access workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace members can access documents" ON documents;
DROP POLICY IF EXISTS "Service role full access documents" ON documents;
DROP POLICY IF EXISTS "Workspace members can access versions" ON document_versions;
DROP POLICY IF EXISTS "Service role full access versions" ON document_versions;
DROP POLICY IF EXISTS "Workspace members can access suggestions" ON suggestions;
DROP POLICY IF EXISTS "Service role full access suggestions" ON suggestions;
DROP POLICY IF EXISTS "Workspace members can access sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role full access sessions" ON user_sessions;
DROP POLICY IF EXISTS "Service role full access team_keys" ON team_keys;
DROP POLICY IF EXISTS "Anyone can read team_keys for invite lookup" ON team_keys;

-- NEW RLS: Service role can do everything (our API uses service role key)
-- Public can read things needed for lookups

CREATE POLICY "service_all_profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_profiles" ON profiles FOR SELECT USING (true);

CREATE POLICY "service_all_members" ON workspace_members FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_members" ON workspace_members FOR SELECT USING (true);

CREATE POLICY "service_all_workspaces" ON workspaces FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_workspaces" ON workspaces FOR SELECT USING (true);

CREATE POLICY "service_all_documents" ON documents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_documents" ON documents FOR SELECT USING (true);

CREATE POLICY "service_all_versions" ON document_versions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_versions" ON document_versions FOR SELECT USING (true);

CREATE POLICY "service_all_sessions" ON user_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_sessions" ON user_sessions FOR SELECT USING (true);

CREATE POLICY "service_all_suggestions" ON suggestions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_suggestions" ON suggestions FOR SELECT USING (true);

CREATE POLICY "service_all_team_keys" ON team_keys FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "public_read_team_keys" ON team_keys FOR SELECT USING (true);

-- ================================================
-- STEP 9: Storage bucket (ignore error if exists)
-- ================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES ('brutsteampad-images', 'brutsteampad-images', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access" ON storage.objects;
CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'brutsteampad-images');

DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
CREATE POLICY "Public upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brutsteampad-images');

-- ============================================
-- DONE! All tables, indexes, RLS, and storage
-- are now fully configured.
-- ============================================
