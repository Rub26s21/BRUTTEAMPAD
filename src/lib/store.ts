/* ============================================
   BRUTSTeamPad — Zustand State Stores
   Global state management for the application
   ============================================ */
import { create } from 'zustand';
import type {
    Workspace,
    Document,
    CollaborationUser,
    Suggestion,
    EditorState,
} from './types';
import { getRandomCursorColor } from './types';

// ---- Auth / Session Store ----
interface AuthStore {
    teamKey: string | null;
    displayName: string | null;
    cursorColor: string;
    sessionId: string | null;
    workspace: Workspace | null;
    isAuthenticated: boolean;
    login: (teamKey: string, displayName: string) => void;
    setWorkspace: (workspace: Workspace) => void;
    setSessionId: (id: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    teamKey: null,
    displayName: null,
    cursorColor: getRandomCursorColor(),
    sessionId: null,
    workspace: null,
    isAuthenticated: false,
    login: (teamKey, displayName) =>
        set({
            teamKey,
            displayName,
            isAuthenticated: true,
        }),
    setWorkspace: (workspace) => set({ workspace }),
    setSessionId: (id) => set({ sessionId: id }),
    logout: () =>
        set({
            teamKey: null,
            displayName: null,
            sessionId: null,
            workspace: null,
            isAuthenticated: false,
            cursorColor: getRandomCursorColor(),
        }),
}));

// ---- Document Store ----
interface DocumentStore {
    documents: Document[];
    activeDocumentId: string | null;
    activeDocument: Document | null;
    isLoading: boolean;
    setDocuments: (docs: Document[]) => void;
    addDocument: (doc: Document) => void;
    removeDocument: (id: string) => void;
    updateDocumentInList: (id: string, updates: Partial<Document>) => void;
    setActiveDocument: (doc: Document | null) => void;
    setActiveDocumentId: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
    documents: [],
    activeDocumentId: null,
    activeDocument: null,
    isLoading: false,
    setDocuments: (documents) => set({ documents }),
    addDocument: (doc) =>
        set((state) => ({ documents: [doc, ...state.documents] })),
    removeDocument: (id) =>
        set((state) => ({
            documents: state.documents.filter((d) => d.id !== id),
            activeDocumentId:
                state.activeDocumentId === id ? null : state.activeDocumentId,
            activeDocument:
                state.activeDocument?.id === id ? null : state.activeDocument,
        })),
    updateDocumentInList: (id, updates) =>
        set((state) => ({
            documents: state.documents.map((d) =>
                d.id === id ? { ...d, ...updates } : d
            ),
            activeDocument:
                state.activeDocument?.id === id
                    ? { ...state.activeDocument, ...updates }
                    : state.activeDocument,
        })),
    setActiveDocument: (doc) =>
        set({ activeDocument: doc, activeDocumentId: doc?.id || null }),
    setActiveDocumentId: (id) => set({ activeDocumentId: id }),
    setLoading: (isLoading) => set({ isLoading }),
}));

// ---- Collaboration Store ----
interface CollaborationStore {
    connectedUsers: CollaborationUser[];
    isConnected: boolean;
    isSynced: boolean;
    setConnectedUsers: (users: CollaborationUser[]) => void;
    setConnected: (connected: boolean) => void;
    setSynced: (synced: boolean) => void;
}

export const useCollaborationStore = create<CollaborationStore>((set) => ({
    connectedUsers: [],
    isConnected: false,
    isSynced: false,
    setConnectedUsers: (connectedUsers) => set({ connectedUsers }),
    setConnected: (isConnected) => set({ isConnected }),
    setSynced: (isSynced) => set({ isSynced }),
}));

// ---- Editor State Store ----
interface EditorStateStore extends EditorState {
    setEditing: (editing: boolean) => void;
    setSaving: (saving: boolean) => void;
    setLastSaved: (date: Date) => void;
    setWordCount: (count: number) => void;
    setCharacterCount: (count: number) => void;
}

export const useEditorStateStore = create<EditorStateStore>((set) => ({
    isEditing: false,
    isSaving: false,
    lastSaved: null,
    wordCount: 0,
    characterCount: 0,
    setEditing: (isEditing) => set({ isEditing }),
    setSaving: (isSaving) => set({ isSaving }),
    setLastSaved: (lastSaved) => set({ lastSaved }),
    setWordCount: (wordCount) => set({ wordCount }),
    setCharacterCount: (characterCount) => set({ characterCount }),
}));

// ---- Suggestion Store ----
interface SuggestionStore {
    suggestions: Suggestion[];
    isPanelOpen: boolean;
    setSuggestions: (suggestions: Suggestion[]) => void;
    addSuggestion: (suggestion: Suggestion) => void;
    updateSuggestion: (id: string, updates: Partial<Suggestion>) => void;
    togglePanel: () => void;
    setPanelOpen: (open: boolean) => void;
}

export const useSuggestionStore = create<SuggestionStore>((set) => ({
    suggestions: [],
    isPanelOpen: false,
    setSuggestions: (suggestions) => set({ suggestions }),
    addSuggestion: (suggestion) =>
        set((state) => ({
            suggestions: [suggestion, ...state.suggestions],
        })),
    updateSuggestion: (id, updates) =>
        set((state) => ({
            suggestions: state.suggestions.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            ),
        })),
    togglePanel: () =>
        set((state) => ({ isPanelOpen: !state.isPanelOpen })),
    setPanelOpen: (isPanelOpen) => set({ isPanelOpen }),
}));

// ---- UI Store ----
interface UIStore {
    sidebarOpen: boolean;
    rightPanelOpen: boolean;
    isCommandPaletteOpen: boolean;
    toggleSidebar: () => void;
    toggleRightPanel: () => void;
    setSidebarOpen: (open: boolean) => void;
    setRightPanelOpen: (open: boolean) => void;
    setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    sidebarOpen: true,
    rightPanelOpen: false,
    isCommandPaletteOpen: false,
    toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleRightPanel: () =>
        set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    setRightPanelOpen: (rightPanelOpen) => set({ rightPanelOpen }),
    setCommandPaletteOpen: (isCommandPaletteOpen) =>
        set({ isCommandPaletteOpen }),
}));
