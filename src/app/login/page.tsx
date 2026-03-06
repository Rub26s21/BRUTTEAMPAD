/* ============================================
   BRUTSTeamPad — Login Page
   Magic link email authentication
   ============================================ */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Sparkles, Zap, Users, FileText } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { signInWithMagicLink, supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    // Check if already logged in
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace('/');
        });
    }, [router]);

    const handleLogin = async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signInWithMagicLink(email.trim());
            setEmailSent(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send login link');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        { icon: <Zap size={18} />, title: 'Real-time Sync', desc: 'Instant CRDT collaboration' },
        { icon: <Users size={18} />, title: 'Team Invites', desc: 'Invite-only workspaces' },
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
                        Secure team collaboration. Sign in to get started.
                    </p>
                </motion.div>

                {/* Login Card */}
                <GlassPanel variant="elevated" padding="lg" neonBorder="brand">
                    {!emailSent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center">
                                    <Mail size={16} className="text-brand-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Sign In
                                    </h2>
                                    <p className="text-xs text-white/40">
                                        We&apos;ll send a magic link to your email
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                    className="glass-input text-base"
                                    id="email-input"
                                    autoFocus
                                />

                                {error && (
                                    <motion.p
                                        className="text-xs text-red-400"
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
                                    onClick={handleLogin}
                                    isLoading={isLoading}
                                    icon={<ArrowRight size={16} />}
                                    id="send-magic-link-btn"
                                >
                                    Send Magic Link
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="text-center py-4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">
                                Check your email!
                            </h3>
                            <p className="text-sm text-white/40 mb-4">
                                We sent a magic link to <span className="text-brand-300 font-mono">{email}</span>
                            </p>
                            <p className="text-xs text-white/25">
                                Click the link in the email to sign in. You can close this tab.
                            </p>
                            <button
                                onClick={() => setEmailSent(false)}
                                className="mt-4 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                            >
                                Use a different email
                            </button>
                        </motion.div>
                    )}
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
