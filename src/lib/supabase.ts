/* ============================================
   BRUTSTeamPad — Supabase Client + Auth Helpers
   Simple email+mobile auth (no verification)
   ============================================ */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Simple Auth Helpers ----

const STORAGE_KEY = 'brutsteampad_user';

/** Save user profile to localStorage */
export function saveUser(profile: any) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
}

/** Get user profile from localStorage */
export function getSavedUser() {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try { return JSON.parse(stored); } catch { return null; }
        }
    }
    return null;
}

/** Clear user profile from localStorage */
export function clearUser() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
    }
}

/** Authenticated fetch — adds X-User-Id header automatically */
export function authFetch(url: string, options: RequestInit = {}) {
    const user = getSavedUser();
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(user ? { 'X-User-Id': user.id } : {}),
        },
    });
}
