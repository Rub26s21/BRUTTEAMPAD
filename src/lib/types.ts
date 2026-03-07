/* ============================================
   BRUTSTeamPad — TypeScript Type Definitions
   ============================================ */

// ---- User Profile ----
export interface Profile {
    id: string;
    email: string;
    mobile: string | null;
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

// ---- User Session ----
export interface UserSession {
    id: string;
    workspace_id: string;
    display_name: string;
    cursor_color: string;
    is_online: boolean;
    last_seen: string;
}

// ---- Online User ----
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

// ---- Cursor Colors (candy/cartoon palette) ----
const CURSOR_COLORS = [
    '#ff6b9d', '#c44dff', '#6366f1', '#06d6a0',
    '#ffd166', '#ff85a1', '#7209b7', '#4cc9f0',
    '#f72585', '#4361ee', '#3a0ca3', '#ff9f1c',
];

export function getRandomCursorColor(): string {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}
