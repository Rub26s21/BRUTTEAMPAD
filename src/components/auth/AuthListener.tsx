/* ============================================
   BRUTSTeamPad — Auth Listener
   Listens for Supabase auth state changes
   ============================================ */
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export function AuthListener() {
    const { setUser, setLoading, logout } = useAuthStore();

    useEffect(() => {
        // Check initial session
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setUser(profile);
                    } else {
                        setUser({
                            id: session.user.id,
                            email: session.user.email || '',
                            username: session.user.email?.split('@')[0] || 'User',
                            avatar_url: null,
                            created_at: new Date().toISOString(),
                        });
                    }
                } else {
                    setLoading(false);
                }
            } catch {
                setLoading(false);
            }
        };

        checkSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) {
                        setUser(profile);
                    } else {
                        setUser({
                            id: session.user.id,
                            email: session.user.email || '',
                            username: session.user.email?.split('@')[0] || 'User',
                            avatar_url: null,
                            created_at: new Date().toISOString(),
                        });
                    }
                } else if (event === 'SIGNED_OUT') {
                    logout();
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [setUser, setLoading, logout]);

    return null; // Invisible component, only manages state
}
