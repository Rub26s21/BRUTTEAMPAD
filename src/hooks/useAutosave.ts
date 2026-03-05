/* ============================================
   BRUTSTeamPad — Autosave Hook
   Debounced periodic save to Supabase
   ============================================ */
'use client';

import { useCallback, useEffect, useRef } from 'react';
import { updateDocument } from '@/lib/supabase-api';
import { useEditorStateStore } from '@/lib/store';

interface UseAutosaveOptions {
    documentId: string | null;
    interval?: number; // ms, default 10000 (10 seconds)
    enabled?: boolean;
}

/**
 * Autosave hook: periodically saves editor content to Supabase.
 * Uses a debounced interval approach — saves every `interval` ms
 * if the content has changed since last save.
 */
export function useAutosave({
    documentId,
    interval = 10000,
    enabled = true,
}: UseAutosaveOptions) {
    const contentRef = useRef<string>('');
    const lastSavedContentRef = useRef<string>('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { setSaving, setLastSaved } = useEditorStateStore();

    const save = useCallback(async () => {
        if (!documentId) return;
        if (!enabled) return;
        if (contentRef.current === lastSavedContentRef.current) return;

        try {
            setSaving(true);
            await updateDocument(documentId, {
                content: contentRef.current,
            });
            lastSavedContentRef.current = contentRef.current;
            setLastSaved(new Date());
        } catch (error) {
            console.error('BRUTSTeamPad: Autosave failed:', error);
        } finally {
            setSaving(false);
        }
    }, [documentId, enabled, setSaving, setLastSaved]);

    // Set up periodic save interval
    useEffect(() => {
        if (!enabled || !documentId) return;

        timerRef.current = setInterval(save, interval);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [save, interval, enabled, documentId]);

    // Save on unmount
    useEffect(() => {
        return () => {
            if (contentRef.current !== lastSavedContentRef.current) {
                save();
            }
        };
    }, [save]);

    // Update function to be called by the editor on content change
    const updateContent = useCallback((html: string) => {
        contentRef.current = html;
    }, []);

    // Force save (e.g., on Ctrl+S)
    const forceSave = useCallback(async () => {
        await save();
    }, [save]);

    return {
        updateContent,
        forceSave,
    };
}
