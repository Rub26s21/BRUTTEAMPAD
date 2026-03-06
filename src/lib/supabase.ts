/* ============================================
   BRUTSTeamPad — Supabase Client
   Browser client with auth persistence
   ============================================ */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
    },
});

// ---- Auth Helpers ----

export async function signInWithMagicLink(email: string, redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        },
    });
    if (error) throw error;
    return data;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
}

export async function getAuthToken(): Promise<string | null> {
    const session = await getSession();
    return session?.access_token || null;
}

// Authenticated fetch helper — adds Bearer token to API requests
export async function authFetch(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}
