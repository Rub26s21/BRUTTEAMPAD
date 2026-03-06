/* ============================================
   BRUTSTeamPad — Invite Join Page
   /invite/[code] — Join workspace via invite
   ============================================ */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, ArrowRight, CheckCircle, XCircle, Layers } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { supabase, authFetch } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import type { Workspace } from '@/lib/types';

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code as string;
    const { user, isAuthenticated } = useAuthStore();
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [joined, setJoined] = useState(false);

    // Check auth first
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                // Redirect to login, then back to invite
                router.replace(`/login?redirect=/invite/${code}`);
            }
        });
    }, [code, router]);

    // Look up workspace by invite code
    useEffect(() => {
        async function lookupWorkspace() {
            try {
                const res = await authFetch(`/api/invite?code=${encodeURIComponent(code)}`);
                const data = await res.json();
                if (res.ok && data.workspace) {
                    setWorkspace(data.workspace);
                    if (data.alreadyMember) {
                        setJoined(true);
                    }
                } else {
                    setError(data.error || 'Invalid invite code');
                }
            } catch {
                setError('Failed to look up invite');
            } finally {
                setIsLoading(false);
            }
        }
        if (isAuthenticated) {
            lookupWorkspace();
        }
    }, [code, isAuthenticated]);

    const handleJoin = async () => {
        setJoining(true);
        setError('');
        try {
            const res = await authFetch('/api/invite', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (res.ok) {
                setJoined(true);
                setTimeout(() => {
                    router.push(`/workspace/${data.workspace_id}`);
                }, 1500);
            } else {
                setError(data.error || 'Failed to join');
            }
        } catch {
            setError('Failed to join workspace');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-mesh">
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-600/10 blur-[100px]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo size="lg" />
                </div>

                <GlassPanel variant="elevated" padding="lg" neonBorder="brand">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <motion.div
                                className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full mx-auto mb-4"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            />
                            <p className="text-white/40 text-sm">Looking up invite...</p>
                        </div>
                    ) : error && !workspace ? (
                        <div className="text-center py-8">
                            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                <XCircle size={28} className="text-red-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Invalid Invite</h3>
                            <p className="text-sm text-white/40 mb-4">{error}</p>
                            <Button variant="ghost" onClick={() => router.push('/')}>
                                Go to Dashboard
                            </Button>
                        </div>
                    ) : joined ? (
                        <motion.div
                            className="text-center py-8"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={28} className="text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                You&apos;re in!
                            </h3>
                            <p className="text-sm text-white/40">
                                Redirecting to workspace...
                            </p>
                        </motion.div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                                    <UserPlus size={18} className="text-brand-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Join Workspace
                                    </h2>
                                    <p className="text-xs text-white/40">
                                        You&apos;ve been invited to collaborate
                                    </p>
                                </div>
                            </div>

                            {workspace && (
                                <div className="mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/30 to-neon-purple/30 flex items-center justify-center border border-brand-500/20">
                                            <Layers size={18} className="text-brand-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">
                                                {workspace.name}
                                            </h3>
                                            <p className="text-xs text-white/30 font-mono">
                                                {code}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <p className="text-xs text-red-400 mb-4">{error}</p>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    size="md"
                                    className="flex-1"
                                    onClick={() => router.push('/')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="neon"
                                    size="md"
                                    className="flex-1"
                                    onClick={handleJoin}
                                    isLoading={joining}
                                    icon={<ArrowRight size={14} />}
                                    id="join-workspace-btn"
                                >
                                    Join
                                </Button>
                            </div>
                        </div>
                    )}
                </GlassPanel>
            </div>
        </div>
    );
}
