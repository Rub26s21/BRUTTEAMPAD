/* ============================================
   BRUTSTeamPad — Type Definitions
   ============================================ */

export interface Workspace {
    id: string;
    team_key: string;
    name: string;
    created_at: string;
}

export interface Document {
    id: string;
    workspace_id: string;
    title: string;
    content: string | null;
    yjs_state: Uint8Array | null;
    created_at: string;
    updated_at: string;
}

export interface DocumentVersion {
    id: string;
    document_id: string;
    content_snapshot: string;
    created_by: string;
    timestamp: string;
}

export interface TeamKey {
    id: string;
    team_key: string;
    workspace_id: string;
    created_at: string;
}

export interface UserSession {
    id: string;
    workspace_id: string;
    display_name: string;
    cursor_color: string;
    is_online: boolean;
    last_seen: string;
}

export interface CollaborationUser {
    id: string;
    name: string;
    color: string;
    isOnline: boolean;
}

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

export interface EditorState {
    isEditing: boolean;
    isSaving: boolean;
    lastSaved: Date | null;
    wordCount: number;
    characterCount: number;
}

// Cursor colors for collaboration
export const CURSOR_COLORS = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#a855f7', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#06b6d4', // cyan
    '#ef4444', // red
    '#eab308', // yellow
    '#14b8a6', // teal
    '#8b5cf6', // violet
] as const;

export function getRandomCursorColor(): string {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}
