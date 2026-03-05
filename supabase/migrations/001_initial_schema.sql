-- ============================================
-- BRUTSTeamPad — Database Schema
-- Supabase PostgreSQL Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- Workspaces ----
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL DEFAULT 'Untitled Workspace',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workspaces_team_key ON workspaces(team_key);

-- ---- Team Keys ----
CREATE TABLE IF NOT EXISTS team_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_key VARCHAR(100) NOT NULL UNIQUE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_team_keys_team_key ON team_keys(team_key);
CREATE INDEX idx_team_keys_workspace ON team_keys(workspace_id);

-- ---- Documents ----
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL DEFAULT 'Untitled Document',
  content TEXT DEFAULT '',
  yjs_state BYTEA,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_documents_updated ON documents(updated_at DESC);

-- ---- Document Versions ----
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_snapshot TEXT NOT NULL,
  created_by VARCHAR(255) DEFAULT 'system',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_versions_document ON document_versions(document_id);
CREATE INDEX idx_versions_timestamp ON document_versions(timestamp DESC);

-- ---- User Sessions ----
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  cursor_color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  is_online BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_workspace ON user_sessions(workspace_id);
CREATE INDEX idx_sessions_online ON user_sessions(workspace_id, is_online);

-- ---- Suggestions ----
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

CREATE INDEX idx_suggestions_document ON suggestions(document_id);
CREATE INDEX idx_suggestions_status ON suggestions(status);

-- ---- Auto-update timestamps ----
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---- Row Level Security ----
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Allow all operations with anon key (team-key auth, not Supabase auth)
CREATE POLICY "Allow all" ON workspaces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON team_keys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON document_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON suggestions FOR ALL USING (true) WITH CHECK (true);

-- ---- Storage Bucket ----
-- Run this in the Supabase dashboard SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('brutsteampad-images', 'brutsteampad-images', true);
-- CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = 'brutsteampad-images');
-- CREATE POLICY "Public upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'brutsteampad-images');
