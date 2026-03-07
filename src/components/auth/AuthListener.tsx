/* ============================================
   BRUTSTeamPad — Auth Listener
   Loads user from localStorage on mount
   ============================================ */
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthListener() {
    const { loadFromStorage } = useAuthStore();

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    return null;
}
