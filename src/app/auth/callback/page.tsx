/* ============================================
   BRUTSTeamPad — Auth Callback
   Handles magic link redirect & session exchange
   ============================================ */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';

export default function AuthCallback() {
    const router = useRouter();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleAuth = async () => {
            try {
                // Exchange code for session (PKCE flow)
                const { searchParams } = new URL(window.location.href);
                const code = searchParams.get('code');

                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) throw error;
                }

                // Wait for session
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    router.replace('/');
                } else {
                    // Fallback: listen for auth state change
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        (event, session) => {
                            if (event === 'SIGNED_IN' && session) {
                                subscription.unsubscribe();
                                router.replace('/');
                            }
                        }
                    );
                    // Timeout after 10s
                    setTimeout(() => {
                        subscription.unsubscribe();
                        setError('Authentication timed out. Please try again.');
                    }, 10000);
                }
            } catch (err: any) {
                console.error('Auth callback error:', err);
                setError(err.message || 'Authentication failed');
            }
        };

        handleAuth();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh">
            <div className="text-center">
                <div className="flex justify-center mb-6">
                    <Logo size="lg" />
                </div>
                {error ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <p className="text-red-400 mb-4">{error}</p>
                        <a
                            href="/login"
                            className="text-brand-400 hover:text-brand-300 text-sm underline"
                        >
                            Back to login
                        </a>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-white/50 text-sm">
                            Signing you in...
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
