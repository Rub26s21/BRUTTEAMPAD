/* ============================================
   BRUTSTeamPad — Login Page
   Liquid cartoon theme with email + mobile
   ============================================ */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Phone, Sparkles, ArrowRight, Zap, Users, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { login, isAuthenticated, loadFromStorage } = useAuthStore();

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async () => {
        setError('');

        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (!mobile.trim()) {
            setError('Please enter your mobile number');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), mobile: mobile.trim() }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed');
                return;
            }

            login(data.profile);
            router.push('/');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Animated liquid blobs */}
            <div className="liquid-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
                <div className="blob blob-4" />
                <div className="bubble bubble-1" />
                <div className="bubble bubble-2" />
                <div className="bubble bubble-3" />
                <div className="bubble bubble-4" />
                <div className="bubble bubble-5" />
            </div>

            <motion.div
                className="login-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {/* Mascot */}
                <motion.div
                    className="mascot-wrap"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring', bounce: 0.5 }}
                >
                    <Image
                        src="/mascot.png"
                        alt="BRUTSTeamPad Mascot"
                        width={120}
                        height={120}
                        className="mascot-img"
                    />
                </motion.div>

                {/* Title */}
                <motion.div
                    className="login-header"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="login-title">
                        <span className="gradient-text-candy">BRUTSTeamPad</span>
                    </h1>
                    <p className="login-subtitle">Hey there! 👋 Jump right into collaboration</p>
                </motion.div>

                {/* Form */}
                <motion.div
                    className="login-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="input-group">
                        <div className="input-icon">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="login-input"
                            id="login-email"
                            onKeyDown={(e) => e.key === 'Enter' && document.getElementById('login-mobile')?.focus()}
                        />
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <Phone size={18} />
                        </div>
                        <input
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className="login-input"
                            id="login-mobile"
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    {error && (
                        <motion.p
                            className="login-error"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        onClick={handleLogin}
                        disabled={isLoading}
                        whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(196, 77, 255, 0.5)' }}
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                        id="login-submit"
                        style={{
                            width: '100%',
                            padding: '18px 24px',
                            border: 'none',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #c44dff, #ff6b9d, #ffd166)',
                            backgroundSize: '200% 200%',
                            color: 'white',
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '12px',
                            boxShadow: '0 8px 30px rgba(196, 77, 255, 0.35)',
                            opacity: isLoading ? 0.7 : 1,
                            animation: 'gradientShift 3s ease infinite',
                            letterSpacing: '0.5px',
                            position: 'relative' as const,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Shimmer overlay */}
                        <motion.div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                pointerEvents: 'none',
                            }}
                            animate={{ left: ['−100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                        />
                        {isLoading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                    <Sparkles size={20} />
                                </motion.div>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <ArrowRight size={22} />
                                </motion.div>
                                <span>Enter BRUTSTeamPad</span>
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <Sparkles size={18} />
                                </motion.div>
                            </>
                        )}
                    </motion.button>
                </motion.div>

                {/* Feature badges */}
                <motion.div
                    className="feature-badges"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="feature-badge">
                        <Zap size={16} />
                        <span>Real-time Sync</span>
                    </div>
                    <div className="feature-badge">
                        <Users size={16} />
                        <span>Team Invites</span>
                    </div>
                    <div className="feature-badge">
                        <FileText size={16} />
                        <span>Rich Editor</span>
                    </div>
                </motion.div>
            </motion.div>

            <style jsx>{`
                .login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #0a0a1a;
                }

                .liquid-bg {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                    z-index: 0;
                }

                .blob {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.5;
                }
                .blob-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, #ff6b9d 0%, #c44dff 50%, transparent 70%);
                    top: -100px; left: -100px;
                    animation: blobFloat1 8s ease-in-out infinite;
                }
                .blob-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #4cc9f0 0%, #6366f1 50%, transparent 70%);
                    bottom: -100px; right: -80px;
                    animation: blobFloat2 10s ease-in-out infinite;
                }
                .blob-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #ffd166 0%, #f72585 50%, transparent 70%);
                    top: 50%; left: 60%;
                    animation: blobFloat3 12s ease-in-out infinite;
                }
                .blob-4 {
                    width: 250px; height: 250px;
                    background: radial-gradient(circle, #06d6a0 0%, #4361ee 50%, transparent 70%);
                    bottom: 30%; left: 10%;
                    animation: blobFloat1 9s ease-in-out infinite reverse;
                }

                .bubble {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    animation: bubbleRise 8s ease-in-out infinite;
                }
                .bubble-1 { width: 20px; height: 20px; bottom: -20px; left: 20%; animation-delay: 0s; animation-duration: 7s; }
                .bubble-2 { width: 14px; height: 14px; bottom: -20px; left: 40%; animation-delay: 1.5s; animation-duration: 9s; }
                .bubble-3 { width: 24px; height: 24px; bottom: -20px; left: 65%; animation-delay: 3s; animation-duration: 8s; }
                .bubble-4 { width: 10px; height: 10px; bottom: -20px; left: 80%; animation-delay: 4s; animation-duration: 10s; }
                .bubble-5 { width: 16px; height: 16px; bottom: -20px; left: 30%; animation-delay: 2s; animation-duration: 11s; }

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
                @keyframes bubbleRise {
                    0% { transform: translateY(0) scale(1); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.3; }
                    100% { transform: translateY(-100vh) scale(0.4); opacity: 0; }
                }

                .login-container {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    max-width: 420px;
                    width: 100%;
                    padding: 0 20px;
                }

                .mascot-wrap {
                    margin-bottom: -10px;
                    z-index: 2;
                    filter: drop-shadow(0 8px 30px rgba(196, 77, 255, 0.3));
                }

                :global(.mascot-img) {
                    animation: mascotBounce 3s ease-in-out infinite;
                }

                @keyframes mascotBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .login-title {
                    font-size: 2.4rem;
                    font-weight: 800;
                    margin: 0 0 8px;
                }

                .gradient-text-candy {
                    background: linear-gradient(135deg, #ff6b9d, #c44dff, #4cc9f0, #06d6a0);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    animation: gradientShift 4s ease infinite;
                }

                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }

                .login-subtitle {
                    color: rgba(255,255,255,0.6);
                    font-size: 1rem;
                    margin: 0;
                }

                .login-card {
                    width: 100%;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px;
                    padding: 32px 28px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                }

                .input-group {
                    position: relative;
                    margin-bottom: 16px;
                }

                .input-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.35);
                    display: flex;
                    transition: color 0.3s;
                }

                .input-group:focus-within .input-icon {
                    color: #c44dff;
                }

                .login-input {
                    width: 100%;
                    padding: 16px 16px 16px 48px;
                    border-radius: 16px;
                    border: 2px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04);
                    color: white;
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s ease;
                }

                .login-input::placeholder {
                    color: rgba(255,255,255,0.25);
                }

                .login-input:focus {
                    border-color: rgba(196, 77, 255, 0.5);
                    background: rgba(196, 77, 255, 0.06);
                    box-shadow: 0 0 20px rgba(196, 77, 255, 0.15);
                }

                .login-error {
                    color: #ff6b9d;
                    font-size: 0.85rem;
                    margin: 0 0 12px;
                    padding: 8px 12px;
                    background: rgba(255, 107, 157, 0.1);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 107, 157, 0.2);
                }

                .login-btn {
                    width: 100%;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #c44dff, #ff6b9d, #ffd166);
                    background-size: 200% 200%;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s ease;
                    animation: gradientShift 3s ease infinite;
                    margin-top: 8px;
                }

                .login-btn:hover {
                    box-shadow: 0 8px 30px rgba(196, 77, 255, 0.4);
                    transform: translateY(-1px);
                }

                .login-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .btn-content, .btn-loading {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                :global(.spin) {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .feature-badges {
                    display: flex;
                    gap: 12px;
                    margin-top: 28px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .feature-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: 12px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.5);
                    font-size: 0.8rem;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .feature-badge:hover {
                    background: rgba(196, 77, 255, 0.1);
                    border-color: rgba(196, 77, 255, 0.3);
                    color: white;
                }

                @media (max-width: 500px) {
                    .login-title { font-size: 1.8rem; }
                    .login-card { padding: 24px 20px; }
                }
            `}</style>
        </div>
    );
}
