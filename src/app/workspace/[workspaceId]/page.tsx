/* ============================================
   BRUTSTeamPad — Workspace Editor Page
   /workspace/[workspaceId] — membership-gated
   ============================================ */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase, authFetch } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Logo } from '@/components/ui/Logo';
import type { Profile } from '@/lib/types';

export default function WorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params.workspaceId as string;
    const { user, isAuthenticated, setUser, setWorkspace } = useAuthStore();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        async function checkAccess() {
            // 1. Check auth
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            // Load profile if not set
            if (!user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    setUser(profile as Profile);
                } else {
                    setUser({
                        id: session.user.id,
                        email: session.user.email || '',
                        username: session.user.email?.split('@')[0] || 'User',
                        avatar_url: null,
                        created_at: new Date().toISOString(),
                    });
                }
            }

            // 2. Check membership
            try {
                const res = await authFetch(`/api/workspace/members?workspaceId=${workspaceId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.isMember) {
                        // Load workspace data
                        const wsRes = await authFetch(`/api/workspace?id=${workspaceId}`);
                        if (wsRes.ok) {
                            const wsData = await wsRes.json();
                            if (wsData.workspace) {
                                setWorkspace(wsData.workspace);
                            }
                        }
                        setAuthorized(true);
                    } else {
                        router.replace('/');
                    }
                } else {
                    router.replace('/');
                }
            } catch {
                router.replace('/');
            } finally {
                setChecking(false);
            }
        }

        checkAccess();
    }, [workspaceId, router, user, setUser, setWorkspace]);

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-mesh">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <Logo size="lg" />
                    </div>
                    <motion.div
                        className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-white/40 text-sm">Loading workspace...</p>
                </div>
            </div>
        );
    }

    if (!authorized) return null;

    return <WorkspaceLayout />;
}
