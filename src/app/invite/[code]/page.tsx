/* ============================================
   BRUTSTeamPad — Invite Page
   Join a workspace via invite code
   ============================================ */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authFetch } from '@/lib/supabase';
import Image from 'next/image';

interface WorkspaceInfo {
    id: string;
    name: string;
    team_key: string;
}

export default function InvitePage() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code as string;
    const { user, isAuthenticated, loadFromStorage } = useAuthStore();
    const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!isAuthenticated) {
            // Redirect to login, then back here
            router.push(`/login?redirect=/invite/${code}`);
            return;
        }

        const fetchInvite = async () => {
            try {
                const res = await authFetch(`/api/invite?code=${code}`);
                const data = await res.json();
                if (res.ok) {
                    setWorkspace(data.workspace);
                    setAlreadyMember(data.alreadyMember);
                } else {
                    setError(data.error || 'Invalid invite');
                }
            } catch {
                setError('Failed to load invite');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvite();
    }, [code, isAuthenticated, loadFromStorage, router]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await authFetch('/api/invite', {
                method: 'POST',
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (res.ok) {
                router.push(`/workspace/${data.workspace_id}`);
            } else {
                setError(data.error || 'Failed to join');
            }
        } finally {
            setJoining(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="invite-page">
            <div className="liquid-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
            </div>

            <motion.div
                className="invite-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Image src="/mascot.png" alt="" width={80} height={80} style={{ margin: '0 auto 16px', display: 'block' }} />

                {isLoading ? (
                    <div className="invite-loading">
                        <Sparkles size={24} className="spin" />
                        <p>Loading invite...</p>
                    </div>
                ) : error ? (
                    <div className="invite-error">
                        <h2>Oops! 😅</h2>
                        <p>{error}</p>
                        <button onClick={() => router.push('/')} className="btn-back">
                            Go to Dashboard
                        </button>
                    </div>
                ) : workspace && (
                    <>
                        <h2 className="invite-title">
                            <Users size={20} />
                            You&apos;re invited! 🎉
                        </h2>
                        <p className="invite-ws-name">{workspace.name}</p>
                        <p className="invite-code">Code: <code>{workspace.team_key}</code></p>

                        {alreadyMember ? (
                            <button
                                className="btn-enter"
                                onClick={() => router.push(`/workspace/${workspace.id}`)}
                            >
                                Open Workspace <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                className="btn-join"
                                onClick={handleJoin}
                                disabled={joining}
                            >
                                {joining ? 'Joining...' : 'Join Workspace'} <ArrowRight size={16} />
                            </button>
                        )}
                    </>
                )}
            </motion.div>

            <style jsx>{`
                .invite-page {
                    min-height: 100vh; display: flex; align-items: center;
                    justify-content: center; background: #0a0a1a; position: relative;
                    overflow: hidden;
                }
                .liquid-bg { position: fixed; inset: 0; z-index: 0; }
                .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.4; }
                .blob-1 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #c44dff, transparent);
                    top: -100px; left: -50px;
                    animation: blobFloat1 8s ease-in-out infinite;
                }
                .blob-2 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #4cc9f0, transparent);
                    bottom: -80px; right: -50px;
                    animation: blobFloat2 10s ease-in-out infinite;
                }
                @keyframes blobFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(30px, -40px) scale(1.1); }
                }
                @keyframes blobFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-30px, 30px) scale(1.15); }
                }
                .invite-card {
                    position: relative; z-index: 10;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px; padding: 36px; max-width: 400px;
                    width: 90%; text-align: center; backdrop-filter: blur(20px);
                }
                .invite-title {
                    display: flex; align-items: center; justify-content: center;
                    gap: 8px; color: white; font-size: 1.3rem; margin: 0 0 12px;
                }
                .invite-ws-name {
                    color: #c44dff; font-size: 1.4rem; font-weight: 700; margin: 0 0 8px;
                }
                .invite-code {
                    color: rgba(255,255,255,0.4); font-size: 0.9rem; margin: 0 0 24px;
                }
                .invite-code code { color: #ffd166; }
                .btn-join, .btn-enter {
                    width: 100%; padding: 14px; border: none; border-radius: 14px;
                    background: linear-gradient(135deg, #c44dff, #ff6b9d);
                    color: white; font-weight: 600; font-size: 1rem;
                    cursor: pointer; display: flex; align-items: center;
                    justify-content: center; gap: 8px; transition: all 0.3s;
                }
                .btn-join:hover, .btn-enter:hover {
                    box-shadow: 0 8px 30px rgba(196, 77, 255, 0.4);
                }
                .btn-back {
                    padding: 12px 24px; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px; background: transparent; color: white;
                    cursor: pointer; margin-top: 16px;
                }
                .invite-loading { color: rgba(255,255,255,0.5); }
                .invite-error h2 { color: white; }
                .invite-error p { color: rgba(255,255,255,0.5); }
                :global(.spin) { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
