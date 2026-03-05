/* ============================================
   BRUTSTeamPad — Realtime Collaboration Hook
   Manages Yjs connection lifecycle for a document
   ============================================ */
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
    initRealtimeConnection,
    type RealtimeConnection,
} from '@/lib/realtime';
import { useAuthStore, useCollaborationStore } from '@/lib/store';
import type { CollaborationUser } from '@/lib/types';

interface UseRealtimeOptions {
    documentId: string | null;
    enabled?: boolean;
}

/**
 * Hook to manage realtime Yjs collaboration for a single document.
 * Handles connection lifecycle, awareness tracking, and cleanup.
 */
export function useRealtime({ documentId, enabled = true }: UseRealtimeOptions) {
    const connectionRef = useRef<RealtimeConnection | null>(null);
    const { displayName, cursorColor } = useAuthStore();
    const { setConnectedUsers, setConnected, setSynced } =
        useCollaborationStore();
    const [ydoc, setYdoc] = useState<any>(null);
    const [provider, setProvider] = useState<any>(null);

    const connect = useCallback(() => {
        if (!documentId || !displayName || !enabled) return;

        // Disconnect existing connection first
        if (connectionRef.current) {
            connectionRef.current.disconnect();
        }

        const connection = initRealtimeConnection({
            documentId,
            userName: displayName,
            userColor: cursorColor,
            onSync: () => {
                setSynced(true);
            },
            onDisconnect: () => {
                setConnected(false);
                setSynced(false);
            },
            onAwarenessChange: (users: CollaborationUser[]) => {
                setConnectedUsers(users);
            },
        });

        connectionRef.current = connection;
        setYdoc(connection.ydoc);
        setProvider(connection.provider);
        setConnected(true);
    }, [
        documentId,
        displayName,
        cursorColor,
        enabled,
        setConnectedUsers,
        setConnected,
        setSynced,
    ]);

    // Connect when documentId changes
    useEffect(() => {
        connect();

        return () => {
            if (connectionRef.current) {
                connectionRef.current.disconnect();
                connectionRef.current = null;
            }
            setConnected(false);
            setSynced(false);
            setConnectedUsers([]);
        };
    }, [documentId, connect, setConnected, setSynced, setConnectedUsers]);

    // Handle page unload
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (connectionRef.current) {
                connectionRef.current.disconnect();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return {
        ydoc,
        provider,
        reconnect: connect,
    };
}
