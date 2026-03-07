-- ============================================
-- BRUTSTeamPad — Auth & Membership System
-- Migration 002: SAFE TO RE-RUN (idempotent)
-- ============================================

-- ---- User Profiles ----
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ---- Auto-create profile on signup ----
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---- Update Workspaces: add owner ----
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id);

-- ---- Workspace Members ----
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON workspace_members(user_id);

-- ---- Drop old permissive policies (ignore errors if not exist) ----
DROP POLICY IF EXISTS "Allow all" ON workspaces;
DROP POLICY IF EXISTS "Allow all" ON team_keys;
DROP POLICY IF EXISTS "Allow all" ON documents;
DROP POLICY IF EXISTS "Allow all" ON document_versions;
DROP POLICY IF EXISTS "Allow all" ON user_sessions;
DROP POLICY IF EXISTS "Allow all" ON suggestions;

-- ---- Profiles RLS ----
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
CREATE POLICY "Service role full access profiles"
  ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ---- Workspace Members RLS ----
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Members can view own memberships" ON workspace_members;
CREATE POLICY "Members can view own memberships"
  ON workspace_members FOR SELECT
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Owners can manage members" ON workspace_members;
CREATE POLICY "Owners can manage members"
  ON workspace_members FOR ALL
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Service role full access members" ON workspace_members;
CREATE POLICY "Service role full access members"
  ON workspace_members FOR ALL USING (auth.role() = 'service_role');

-- ---- Workspaces RLS (member-only access) ----
DROP POLICY IF EXISTS "Members can read workspaces" ON workspaces;
CREATE POLICY "Members can read workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR owner_id = auth.uid()
  );
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON workspaces;
CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Owners can update workspaces" ON workspaces;
CREATE POLICY "Owners can update workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Owners can delete workspaces" ON workspaces;
CREATE POLICY "Owners can delete workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());
DROP POLICY IF EXISTS "Service role full access workspaces" ON workspaces;
CREATE POLICY "Service role full access workspaces"
  ON workspaces FOR ALL USING (auth.role() = 'service_role');

-- ---- Documents RLS (workspace member access) ----
DROP POLICY IF EXISTS "Workspace members can access documents" ON documents;
CREATE POLICY "Workspace members can access documents"
  ON documents FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Service role full access documents" ON documents;
CREATE POLICY "Service role full access documents"
  ON documents FOR ALL USING (auth.role() = 'service_role');

-- ---- Document Versions RLS ----
DROP POLICY IF EXISTS "Workspace members can access versions" ON document_versions;
CREATE POLICY "Workspace members can access versions"
  ON document_versions FOR ALL
  USING (
    document_id IN (
      SELECT d.id FROM documents d
      JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Service role full access versions" ON document_versions;
CREATE POLICY "Service role full access versions"
  ON document_versions FOR ALL USING (auth.role() = 'service_role');

-- ---- Suggestions RLS ----
DROP POLICY IF EXISTS "Workspace members can access suggestions" ON suggestions;
CREATE POLICY "Workspace members can access suggestions"
  ON suggestions FOR ALL
  USING (
    document_id IN (
      SELECT d.id FROM documents d
      JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
      WHERE wm.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "Service role full access suggestions" ON suggestions;
CREATE POLICY "Service role full access suggestions"
  ON suggestions FOR ALL USING (auth.role() = 'service_role');

-- ---- User Sessions RLS ----
DROP POLICY IF EXISTS "Workspace members can access sessions" ON user_sessions;
CREATE POLICY "Workspace members can access sessions"
  ON user_sessions FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Service role full access sessions" ON user_sessions;
CREATE POLICY "Service role full access sessions"
  ON user_sessions FOR ALL USING (auth.role() = 'service_role');

-- ---- Team Keys RLS ----
DROP POLICY IF EXISTS "Service role full access team_keys" ON team_keys;
CREATE POLICY "Service role full access team_keys"
  ON team_keys FOR ALL USING (auth.role() = 'service_role');
DROP POLICY IF EXISTS "Anyone can read team_keys for invite lookup" ON team_keys;
CREATE POLICY "Anyone can read team_keys for invite lookup"
  ON team_keys FOR SELECT USING (true);
