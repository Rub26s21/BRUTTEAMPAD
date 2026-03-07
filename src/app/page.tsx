/* ============================================
   BRUTSTeamPad — Dashboard
   Workspace listing with liquid cartoon theme
   ============================================ */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Copy,
    Link2,
    Crown,
    Sparkles,
    LogOut,
    ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authFetch } from '@/lib/supabase';
import Image from 'next/image';

interface WorkspaceItem {
    id: string;
    name: string;
    team_key: string;
    owner_id: string | null;
    role: string;
    created_at: string;
}

export default function Dashboard() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, logout, loadFromStorage } = useAuthStore();
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchWorkspaces = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoading(true);
        try {
            const res = await authFetch('/api/workspace');
            const data = await res.json();
            setWorkspaces(data.workspaces || []);
        } catch {
            setWorkspaces([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthenticated) fetchWorkspaces();
    }, [isAuthenticated, fetchWorkspaces]);

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await authFetch('/api/workspace', {
                method: 'POST',
                body: JSON.stringify({ name: newName.trim() }),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewName('');
                fetchWorkspaces();
            }
        } finally {
            setCreating(false);
        }
    };

    const copyInviteLink = (teamKey: string) => {
        const link = `${window.location.origin}/invite/${teamKey}`;
        navigator.clipboard.writeText(link);
        setCopied(teamKey);
        setTimeout(() => setCopied(null), 2000);
    };

    if (authLoading || !isAuthenticated) {
        return (
            <div className="dash-loading">
                <div className="loading-blob" />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            {/* Liquid background */}
            <div className="liquid-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="dash-content">
                {/* Header */}
                <motion.header
                    className="dash-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="dash-header-left">
                        <Image src="/mascot.png" alt="Mascot" width={48} height={48} />
                        <div>
                            <h1 className="dash-title gradient-text-candy">BRUTSTeamPad</h1>
                            <p className="dash-subtitle">
                                Hey {user?.username || 'there'}! 👋
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn-logout"
                        onClick={() => { logout(); router.push('/login'); }}
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </motion.header>

                {/* Workspace grid */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="section-header">
                        <h2>Your Workspaces</h2>
                        <motion.button
                            className="btn-create"
                            onClick={() => setShowCreateModal(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus size={18} />
                            New Workspace
                        </motion.button>
                    </div>

                    {isLoading ? (
                        <div className="ws-grid">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="ws-card-skeleton shimmer" />
                            ))}
                        </div>
                    ) : workspaces.length === 0 ? (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Image src="/mascot.png" alt="" width={80} height={80} style={{ opacity: 0.6 }} />
                            <h3>No workspaces yet!</h3>
                            <p>Create your first workspace to start collaborating ✨</p>
                            <button
                                className="btn-create"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Sparkles size={16} />
                                Create Workspace
                            </button>
                        </motion.div>
                    ) : (
                        <div className="ws-grid">
                            <AnimatePresence>
                                {workspaces.map((ws, i) => (
                                    <motion.div
                                        key={ws.id}
                                        className="ws-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                    >
                                        <div className="ws-card-header">
                                            <h3>{ws.name}</h3>
                                            {ws.role === 'owner' && (
                                                <span className="owner-badge">
                                                    <Crown size={12} />
                                                    Owner
                                                </span>
                                            )}
                                        </div>

                                        <div className="ws-card-code">
                                            <code>{ws.team_key}</code>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); copyInviteLink(ws.team_key); }}
                                                className="btn-copy"
                                                title="Copy invite link"
                                            >
                                                {copied === ws.team_key ? (
                                                    <span className="copy-done">Copied! ✓</span>
                                                ) : (
                                                    <>
                                                        <Link2 size={13} />
                                                        <Copy size={13} />
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <button
                                            className="btn-enter"
                                            onClick={() => router.push(`/workspace/${ws.id}`)}
                                        >
                                            Enter Workspace
                                            <ArrowRight size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.section>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            className="modal-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Create New Workspace ✨</h3>
                            <input
                                type="text"
                                placeholder="Enter workspace name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="modal-input"
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button
                                    className="btn-cancel"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-create"
                                    onClick={handleCreate}
                                    disabled={creating || !newName.trim()}
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .dashboard {
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                    background: #0a0a1a;
                }
                .liquid-bg {
                    position: fixed; inset: 0; overflow: hidden; z-index: 0;
                }
                .blob {
                    position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.35;
                }
                .blob-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, #ff6b9d 0%, #c44dff 50%, transparent 70%);
                    top: -150px; left: -100px;
                    animation: blobFloat1 8s ease-in-out infinite;
                }
                .blob-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #4cc9f0 0%, #6366f1 50%, transparent 70%);
                    bottom: -100px; right: -80px;
                    animation: blobFloat2 10s ease-in-out infinite;
                }
                .blob-3 {
                    width: 350px; height: 350px;
                    background: radial-gradient(circle, #06d6a0 0%, #ffd166 50%, transparent 70%);
                    top: 40%; left: 50%;
                    animation: blobFloat3 12s ease-in-out infinite;
                }
                @keyframes blobFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes blobFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.15); }
                    66% { transform: translate(25px, -40px) scale(0.85); }
                }
                @keyframes blobFloat3 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                    50% { transform: translate(-30px, 40px) rotate(180deg) scale(1.2); }
                }
                .dash-content {
                    position: relative; z-index: 10;
                    max-width: 960px; margin: 0 auto; padding: 32px 24px;
                }
                .dash-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 40px; padding: 20px 24px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; backdrop-filter: blur(20px);
                }
                .dash-header-left {
                    display: flex; align-items: center; gap: 14px;
                }
                .dash-title {
                    font-size: 1.5rem; font-weight: 800; margin: 0;
                    background: linear-gradient(135deg, #ff6b9d, #c44dff, #4cc9f0);
                    background-size: 300% 300%;
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                    background-clip: text; animation: gradientShift 4s ease infinite;
                }
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .dash-subtitle {
                    margin: 2px 0 0; color: rgba(255,255,255,0.5); font-size: 0.9rem;
                }
                .btn-logout {
                    display: flex; align-items: center; gap: 6px;
                    padding: 10px 18px; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6);
                    cursor: pointer; font-size: 0.85rem; transition: all 0.3s;
                }
                .btn-logout:hover {
                    background: rgba(255, 107, 157, 0.15); color: #ff6b9d;
                    border-color: rgba(255, 107, 157, 0.3);
                }
                .section-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 20px;
                }
                .section-header h2 {
                    color: rgba(255,255,255,0.8); font-size: 1.2rem; margin: 0;
                }
                .btn-create {
                    display: flex; align-items: center; gap: 8px;
                    padding: 12px 20px; border: none; border-radius: 14px;
                    background: linear-gradient(135deg, #c44dff, #ff6b9d);
                    color: white; font-weight: 600; font-size: 0.9rem;
                    cursor: pointer; transition: all 0.3s;
                }
                .btn-create:hover {
                    box-shadow: 0 6px 25px rgba(196, 77, 255, 0.4);
                    transform: translateY(-1px);
                }
                .btn-create:disabled { opacity: 0.6; cursor: not-allowed; }
                .ws-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }
                .ws-card {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; padding: 24px;
                    backdrop-filter: blur(10px); cursor: pointer;
                    transition: all 0.3s;
                }
                .ws-card:hover {
                    border-color: rgba(196, 77, 255, 0.3);
                    box-shadow: 0 8px 30px rgba(196, 77, 255, 0.15);
                }
                .ws-card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 12px;
                }
                .ws-card-header h3 {
                    margin: 0; font-size: 1.1rem; color: white; font-weight: 600;
                }
                .owner-badge {
                    display: flex; align-items: center; gap: 4px;
                    padding: 3px 10px; border-radius: 8px; font-size: 0.7rem;
                    background: rgba(255, 209, 102, 0.15); color: #ffd166;
                    border: 1px solid rgba(255, 209, 102, 0.3);
                }
                .ws-card-code {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 8px 12px; border-radius: 10px;
                    background: rgba(255,255,255,0.04); margin-bottom: 16px;
                }
                .ws-card-code code {
                    font-size: 0.85rem; color: #c44dff; font-weight: 600;
                }
                .btn-copy {
                    display: flex; align-items: center; gap: 4px;
                    background: none; border: none; color: rgba(255,255,255,0.4);
                    cursor: pointer; font-size: 0.75rem; transition: color 0.3s;
                }
                .btn-copy:hover { color: white; }
                .copy-done { color: #06d6a0; font-size: 0.75rem; }
                .btn-enter {
                    width: 100%; padding: 12px; border: none; border-radius: 12px;
                    background: rgba(255,255,255,0.06); color: white;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    cursor: pointer; font-weight: 500; font-size: 0.9rem;
                    transition: all 0.3s;
                }
                .btn-enter:hover {
                    background: linear-gradient(135deg, rgba(196,77,255,0.2), rgba(255,107,157,0.2));
                }
                .empty-state {
                    text-align: center; padding: 60px 20px;
                    background: rgba(255,255,255,0.03); border-radius: 24px;
                    border: 1px dashed rgba(255,255,255,0.1);
                }
                .empty-state h3 { color: white; margin: 16px 0 8px; }
                .empty-state p { color: rgba(255,255,255,0.5); margin-bottom: 20px; }
                .ws-card-skeleton {
                    height: 160px; border-radius: 20px;
                    background: rgba(255,255,255,0.05);
                }
                .modal-overlay {
                    position: fixed; inset: 0; z-index: 100;
                    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                }
                .modal-card {
                    background: rgba(20,20,35,0.95);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px; padding: 32px; max-width: 400px; width: 90%;
                    backdrop-filter: blur(20px);
                }
                .modal-card h3 { color: white; margin: 0 0 20px; font-size: 1.2rem; }
                .modal-input {
                    width: 100%; padding: 14px 16px; border-radius: 14px;
                    border: 2px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.05); color: white;
                    font-size: 1rem; outline: none; margin-bottom: 16px;
                    transition: border-color 0.3s;
                }
                .modal-input:focus { border-color: rgba(196, 77, 255, 0.5); }
                .modal-input::placeholder { color: rgba(255,255,255,0.3); }
                .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .btn-cancel {
                    padding: 10px 20px; border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: rgba(255,255,255,0.6);
                    cursor: pointer; font-size: 0.9rem;
                }
                .dash-loading {
                    min-height: 100vh; display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    background: #0a0a1a; color: rgba(255,255,255,0.4);
                }
                .loading-blob {
                    width: 60px; height: 60px; border-radius: 50%;
                    background: linear-gradient(135deg, #c44dff, #ff6b9d);
                    animation: pulse 1.5s ease-in-out infinite;
                    margin-bottom: 16px;
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.2); opacity: 0.6; }
                }
                :global(.shimmer) {
                    animation: shimmer 1.5s ease-in-out infinite;
                }
                @keyframes shimmer {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
