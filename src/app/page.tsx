/* ============================================
   BRUTSTeamPad — Dashboard (Landing Page)
   Workspace Creator & Selector
   ============================================ */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Copy,
    ExternalLink,
    Layers,
    Check,
    X,
    Sparkles,
    Zap,
    Users,
    FileText,
    KeyRound,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';

interface WorkspaceItem {
    id: string;
    name: string;
    team_key: string;
    created_at: string;
}

function generateTeamKey(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `BRUTS-${num}`;
}

export default function Dashboard() {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Fetch workspaces
    const fetchWorkspaces = useCallback(async () => {
        try {
            const res = await fetch('/api/workspace');
            if (res.ok) {
                const data = await res.json();
                setWorkspaces(data.workspaces || []);
            }
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    // Create workspace
    const handleCreate = async () => {
        if (!newName.trim()) {
            setError('Please enter a workspace name');
            return;
        }
        setCreating(true);
        setError('');
        try {
            const teamKey = generateTeamKey();
            const res = await fetch('/api/workspace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName.trim(), teamKey }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error || 'Failed to create');
            }
            setShowModal(false);
            setNewName('');
            fetchWorkspaces();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    // Copy team key
    const copyKey = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const features = [
        { icon: <Zap size={18} />, title: 'Real-time Sync', desc: 'Instant CRDT collaboration' },
        { icon: <Users size={18} />, title: 'Live Cursors', desc: 'See everyone editing live' },
        { icon: <FileText size={18} />, title: 'Rich Editor', desc: 'Full markdown & media' },
    ];

    return (
        <div className="min-h-screen bg-mesh overflow-auto">
            {/* Ambient orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-600/10 blur-[100px]"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-neon-purple/10 blur-[100px]"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.12, 0.08] }}
                    transition={{ duration: 10, repeat: Infinity }}
                />
            </div>

            {/* Top Bar */}
            <header className="relative z-10 border-b border-white/10 bg-[rgba(10,10,20,0.7)] backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Logo size="sm" />
                    <h1 className="text-sm font-medium text-white/60 hidden sm:block">
                        Workspace Dashboard
                    </h1>
                    <Button
                        variant="neon"
                        size="sm"
                        icon={<Plus size={14} />}
                        onClick={() => setShowModal(true)}
                        id="create-workspace-btn"
                    >
                        Create Workspace
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
                {/* Hero */}
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                        Your Workspaces
                    </h2>
                    <p className="text-white/40 text-sm max-w-md mx-auto">
                        Create a workspace, share the team key, and start collaborating instantly.
                    </p>
                </motion.div>

                {/* Feature pills */}
                <motion.div
                    className="flex justify-center gap-3 mb-10 flex-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] border border-white/10 text-xs text-white/50"
                        >
                            <span className="text-brand-400">{f.icon}</span>
                            {f.title}
                        </div>
                    ))}
                </motion.div>

                {/* Workspace Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <motion.div
                            className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-400 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                ) : workspaces.length === 0 ? (
                    <motion.div
                        className="text-center py-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <GlassPanel
                            variant="flat"
                            padding="lg"
                            className="max-w-md mx-auto"
                        >
                            <div className="text-brand-400/40 mb-4 flex justify-center">
                                <Layers size={48} />
                            </div>
                            <h3 className="text-lg font-semibold text-white/70 mb-2">
                                No workspaces yet
                            </h3>
                            <p className="text-sm text-white/30 mb-6">
                                Create your first workspace to start collaborating with your team.
                            </p>
                            <Button
                                variant="neon"
                                size="lg"
                                icon={<Plus size={16} />}
                                onClick={() => setShowModal(true)}
                                className="mx-auto"
                            >
                                Create Workspace
                            </Button>
                        </GlassPanel>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {workspaces.map((ws, i) => (
                            <motion.div
                                key={ws.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <GlassPanel
                                    variant="elevated"
                                    padding="md"
                                    neonBorder="brand"
                                    className="group hover:border-brand-400/40 transition-all duration-300"
                                >
                                    {/* Workspace Name */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600/30 to-neon-purple/30 flex items-center justify-center border border-brand-500/20">
                                                <Layers
                                                    size={18}
                                                    className="text-brand-400"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white truncate max-w-[180px]">
                                                    {ws.name}
                                                </h3>
                                                <p className="text-[10px] text-white/25 mt-0.5">
                                                    {new Date(ws.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Key */}
                                    <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)] border border-white/8">
                                        <KeyRound size={12} className="text-brand-400/60 flex-shrink-0" />
                                        <span className="font-mono text-sm text-brand-300 tracking-wider flex-1">
                                            {ws.team_key}
                                        </span>
                                        <button
                                            onClick={() => copyKey(ws.team_key, ws.id)}
                                            className="text-white/30 hover:text-white/70 transition-colors p-1"
                                            title="Copy team key"
                                        >
                                            {copiedId === ws.id ? (
                                                <Check size={14} className="text-green-400" />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Open Button */}
                                    <Button
                                        variant="glass"
                                        size="sm"
                                        className="w-full group-hover:bg-[rgba(255,255,255,0.12)]"
                                        icon={<ExternalLink size={14} />}
                                        onClick={() =>
                                            router.push(`/workspace/${ws.id}?key=${ws.team_key}`)
                                        }
                                        id={`open-workspace-${ws.id}`}
                                    >
                                        Open Workspace
                                    </Button>
                                </GlassPanel>
                            </motion.div>
                        ))}

                        {/* Create new card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: workspaces.length * 0.06 }}
                        >
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full h-full min-h-[180px] rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-500/40 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
                            >
                                <div className="w-12 h-12 rounded-full bg-brand-600/10 group-hover:bg-brand-600/20 flex items-center justify-center transition-colors">
                                    <Plus
                                        size={22}
                                        className="text-brand-400/50 group-hover:text-brand-400"
                                    />
                                </div>
                                <span className="text-sm text-white/30 group-hover:text-white/60 font-medium">
                                    New Workspace
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </main>

            {/* Create Workspace Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Backdrop */}
                        <motion.div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                                setShowModal(false);
                                setError('');
                                setNewName('');
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />

                        {/* Modal */}
                        <motion.div
                            className="relative z-10 w-full max-w-md"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <GlassPanel variant="elevated" padding="lg" neonBorder="brand">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center">
                                            <Sparkles size={18} className="text-brand-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-white">
                                                Create Workspace
                                            </h2>
                                            <p className="text-xs text-white/40">
                                                A team key will be generated automatically
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setError('');
                                            setNewName('');
                                        }}
                                        className="text-white/30 hover:text-white/70 transition-colors p-1"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs text-white/40 mb-2 font-medium">
                                            Workspace Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., FOSS Hack Team"
                                            value={newName}
                                            onChange={(e) => {
                                                setNewName(e.target.value);
                                                setError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                            className="glass-input text-base"
                                            id="workspace-name-input"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            className="text-xs text-red-400"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            size="md"
                                            className="flex-1"
                                            onClick={() => {
                                                setShowModal(false);
                                                setError('');
                                                setNewName('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="neon"
                                            size="md"
                                            className="flex-1"
                                            onClick={handleCreate}
                                            isLoading={creating}
                                            icon={<Sparkles size={14} />}
                                            id="confirm-create-btn"
                                        >
                                            Create
                                        </Button>
                                    </div>
                                </div>
                            </GlassPanel>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
