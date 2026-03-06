/* ============================================
   BRUTSTeamPad — TypeScript Type Definitions
   Core types for the application domain
   ============================================ */

// ---- User Profile (Supabase Auth) ----
export interface Profile {
    id: string;
    email: string;
    username: string | null;
    avatar_url: string | null;
    created_at: string;
}

// ---- Workspace ----
export interface Workspace {
    id: string;
    name: string;
    team_key: string;
    owner_id: string | null;
    created_at: string;
    updated_at: string;
}

// ---- Workspace Member ----
export interface WorkspaceMember {
    id: string;
    workspace_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
    profile?: Profile;
}

// ---- Document ----
export interface Document {
    id: string;
    workspace_id: string;
    title: string;
    content: string;
    yjs_state?: Uint8Array;
    created_at: string;
    updated_at: string;
}

// ---- Document Version ----
export interface DocumentVersion {
    id: string;
    document_id: string;
    content_snapshot: string;
    created_by: string;
    timestamp: string;
}

// ---- User Session (legacy, for WebSocket presence) ----
export interface UserSession {
    id: string;
    workspace_id: string;
    display_name: string;
    cursor_color: string;
    is_online: boolean;
    last_seen: string;
}

// ---- Online User (Supabase Presence) ----
export interface OnlineUser {
    user_id: string;
    username: string;
    email: string;
    online_at: string;
    cursor_color: string;
}

// ---- Collaboration User ----
export interface CollaborationUser {
    clientId: number;
    name: string;
    color: string;
}

// ---- Suggestion ----
export interface Suggestion {
    id: string;
    document_id: string;
    author: string;
    content: string;
    original_text: string;
    suggested_text: string;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

// ---- Editor State ----
export interface EditorState {
    isEditing: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    wordCount: number;
    characterCount: number;
}

// ---- Cursor Colors ----
const CURSOR_COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#14b8a6', '#f43f5e', '#6366f1', '#a855f7',
];

export function getRandomCursorColor(): string {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}
