/* ============================================
   BRUTSTeamPad — Yjs Realtime Collaboration
   CRDT-based real-time document sync engine
   ============================================ */
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { CollaborationUser } from './types';

export interface RealtimeConfig {
    documentId: string;
    userName: string;
    userColor: string;
    wsUrl?: string;
    onSync?: () => void;
    onDisconnect?: () => void;
    onAwarenessChange?: (users: CollaborationUser[]) => void;
}

export interface RealtimeConnection {
    ydoc: Y.Doc;
    provider: WebsocketProvider;
    disconnect: () => void;
    getUsers: () => CollaborationUser[];
}

const DEFAULT_WS_URL =
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234';

/**
 * Initialize a realtime Yjs collaboration session for a document.
 * Each document gets its own Y.Doc and WebSocket room.
 */
export function initRealtimeConnection(
    config: RealtimeConfig
): RealtimeConnection {
    const {
        documentId,
        userName,
        userColor,
        wsUrl = DEFAULT_WS_URL,
        onSync,
        onDisconnect,
        onAwarenessChange,
    } = config;

    // Create a new Yjs document
    const ydoc = new Y.Doc();

    // Room name is scoped by document ID
    const roomName = `brutsteampad-${documentId}`;

    // Connect via WebSocket
    const provider = new WebsocketProvider(wsUrl, roomName, ydoc, {
        connect: true,
        maxBackoffTime: 10000,
        disableBc: false, // Enable broadcast channel for same-tab sync
    });

    // Set local user awareness
    provider.awareness.setLocalStateField('user', {
        name: userName,
        color: userColor,
        id: ydoc.clientID.toString(),
    });

    // Handle sync events
    provider.on('sync', (isSynced: boolean) => {
        if (isSynced && onSync) {
            onSync();
        }
    });

    provider.on('status', (event: { status: string }) => {
        if (event.status === 'disconnected' && onDisconnect) {
            onDisconnect();
        }
    });

    // Track awareness changes (user join/leave/cursor movement)
    provider.awareness.on('change', () => {
        if (onAwarenessChange) {
            const users = getConnectedUsers(provider);
            onAwarenessChange(users);
        }
    });

    // Disconnect cleanup function
    const disconnect = () => {
        provider.awareness.setLocalState(null);
        provider.disconnect();
        ydoc.destroy();
    };

    return {
        ydoc,
        provider,
        disconnect,
        getUsers: () => getConnectedUsers(provider),
    };
}

/**
 * Get list of currently connected users from awareness.
 */
function getConnectedUsers(
    provider: WebsocketProvider
): CollaborationUser[] {
    const states = provider.awareness.getStates();
    const users: CollaborationUser[] = [];

    states.forEach((state, clientId) => {
        if (state.user) {
            users.push({
                id: clientId.toString(),
                name: state.user.name,
                color: state.user.color,
                isOnline: true,
            });
        }
    });

    return users;
}

/**
 * Get the XML fragment for TipTap editor binding.
 */
export function getEditorFragment(ydoc: Y.Doc): Y.XmlFragment {
    return ydoc.getXmlFragment('prosemirror');
}

/**
 * Export document state as a binary update for persistence.
 */
export function encodeDocumentState(ydoc: Y.Doc): Uint8Array {
    return Y.encodeStateAsUpdate(ydoc);
}

/**
 * Apply a saved state to a Y.Doc (for restoring from database).
 */
export function applyDocumentState(
    ydoc: Y.Doc,
    state: Uint8Array
): void {
    Y.applyUpdate(ydoc, state);
}
