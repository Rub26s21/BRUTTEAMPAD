/* ============================================
   BRUTSTeamPad — Login Page
   Team Key authentication flow
   ============================================ */
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, User, ArrowRight, Sparkles, Zap, Users, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store';
import { getOrCreateWorkspace, registerUserSession } from '@/lib/supabase-api';

export function LoginPage({ prefilledTeamKey = '' }: { prefilledTeamKey?: string }) {
    const [teamKey, setTeamKey] = useState(prefilledTeamKey);
    const [displayName, setDisplayName] = useState('');
    const [step, setStep] = useState<'key' | 'name'>(prefilledTeamKey ? 'name' : 'key');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, setWorkspace, setSessionId, cursorColor } = useAuthStore();

    const handleKeySubmit = useCallback(async () => {
        if (!teamKey.trim()) {
            setError('Please enter a Team Key');
            return;
        }
        if (teamKey.trim().length < 3) {
            setError('Team Key must be at least 3 characters');
            return;
        }
        setError('');
        setStep('name');
    }, [teamKey]);

    const handleJoin = useCallback(async () => {
        if (!displayName.trim()) {
            setError('Please enter your display name');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            // Get or create workspace for the team key
            const workspace = await getOrCreateWorkspace(teamKey.trim());

            // Register user session
            const sessionId = await registerUserSession(
                workspace.id,
                displayName.trim(),
                cursorColor
            );

            // Update global state
            login(teamKey.trim(), displayName.trim());
            setWorkspace(workspace);
            setSessionId(sessionId);
        } catch (err) {
            console.error('Login failed:', err);
            setError('Failed to join workspace. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    }, [teamKey, displayName, cursorColor, login, setWorkspace, setSessionId]);

    const features = [
        { icon: <Zap size={18} />, title: 'Real-time Sync', desc: 'Instant CRDT collaboration' },
        { icon: <Users size={18} />, title: 'Live Cursors', desc: 'See everyone editing live' },
        { icon: <FileText size={18} />, title: 'Rich Editor', desc: 'Full markdown & media' },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-mesh overflow-auto">
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

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex justify-center mb-4">
                        <Logo size="lg" />
                    </div>
                    <p className="text-sm text-white/40 max-w-xs mx-auto">
                        Collaborate in real time with your team. No accounts needed.
                    </p>
                </motion.div>

                {/* Login Card */}
                <GlassPanel variant="elevated" padding="lg" neonBorder="brand">
                    <AnimatePresence mode="wait">
                        {step === 'key' ? (
                            <motion.div
                                key="step-key"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
                                        <KeyRound size={16} className="text-brand-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Enter Team Key
                                        </h2>
                                        <p className="text-xs text-white/40">
                                            Shared key to join your workspace
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="e.g., BRUTS-2026"
                                            value={teamKey}
                                            onChange={(e) => {
                                                setTeamKey(e.target.value.toUpperCase());
                                                setError('');
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleKeySubmit()}
                                            className="glass-input text-center text-lg font-mono tracking-widest uppercase"
                                            id="team-key-input"
                                            autoFocus
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            className="text-xs text-red-400 text-center"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <Button
                                        variant="neon"
                                        size="lg"
                                        className="w-full"
                                        onClick={handleKeySubmit}
                                        icon={<ArrowRight size={16} />}
                                        id="continue-btn"
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step-name"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                                        <User size={16} className="text-neon-purple" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">
                                            Your Display Name
                                        </h2>
                                        <p className="text-xs text-white/40">
                                            How others will see you
                                        </p>
                                    </div>
                                </div>

                                {/* Team key badge */}
                                <div className="flex items-center justify-center mb-4">
                                    <div className="glass-badge gap-1.5">
                                        <KeyRound size={10} className="text-brand-400" />
                                        <span className="text-brand-300 font-mono">
                                            {teamKey}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="e.g., Rubs"
                                        value={displayName}
                                        onChange={(e) => {
                                            setDisplayName(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                        className="glass-input text-center text-lg"
                                        id="display-name-input"
                                        autoFocus
                                    />

                                    {/* Color preview */}
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-xs text-white/30">Cursor color:</span>
                                        <div
                                            className="w-4 h-4 rounded-full ring-2 ring-white/10"
                                            style={{ backgroundColor: cursorColor }}
                                        />
                                    </div>

                                    {error && (
                                        <motion.p
                                            className="text-xs text-red-400 text-center"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="flex-1"
                                            onClick={() => {
                                                setStep('key');
                                                setError('');
                                            }}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="neon"
                                            size="lg"
                                            className="flex-1"
                                            onClick={handleJoin}
                                            isLoading={isLoading}
                                            icon={<Sparkles size={16} />}
                                            id="join-workspace-btn"
                                        >
                                            Join Workspace
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </GlassPanel>

                {/* Feature cards */}
                <motion.div
                    className="grid grid-cols-3 gap-3 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            className="glass-panel-flat p-3 text-center"
                            whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.25)' }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="text-brand-400/70 flex justify-center mb-2">
                                {feature.icon}
                            </div>
                            <p className="text-[11px] font-semibold text-white/60">
                                {feature.title}
                            </p>
                            <p className="text-[9px] text-white/25 mt-0.5">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default LoginPage;
