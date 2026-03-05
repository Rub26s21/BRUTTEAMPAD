/* ============================================
   BRUTSTeamPad — Keyboard Shortcuts Hook
   ============================================ */
'use client';

import { useEffect, useCallback } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    action: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            for (const shortcut of shortcuts) {
                const ctrlOrMeta =
                    (shortcut.ctrl && (e.ctrlKey || e.metaKey)) ||
                    (shortcut.meta && e.metaKey);
                const shiftMatch = shortcut.shift ? e.shiftKey : true;
                const keyMatch =
                    e.key.toLowerCase() === shortcut.key.toLowerCase();

                if (ctrlOrMeta && shiftMatch && keyMatch) {
                    e.preventDefault();
                    shortcut.action();
                    return;
                }
            }
        },
        [shortcuts]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
