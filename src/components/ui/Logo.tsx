/* ============================================
   BRUTSTeamPad — Logo Component
   ============================================ */
'use client';

import { motion } from 'framer-motion';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showName?: boolean;
}

const sizeMap = {
    sm: { icon: 24, text: 'text-sm' },
    md: { icon: 32, text: 'text-lg' },
    lg: { icon: 48, text: 'text-2xl' },
};

export function Logo({ size = 'md', showName = true }: LogoProps) {
    const { icon: iconSize, text: textClass } = sizeMap[size];

    return (
        <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Logo Icon — stylized "B" with neon glow */}
            <div className="relative">
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Glow effect */}
                    <defs>
                        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Background shape */}
                    <rect
                        x="4"
                        y="4"
                        width="40"
                        height="40"
                        rx="12"
                        fill="rgba(99, 102, 241, 0.15)"
                        stroke="url(#logoGrad)"
                        strokeWidth="1.5"
                    />
                    {/* B letter */}
                    <text
                        x="24"
                        y="33"
                        textAnchor="middle"
                        fill="url(#logoGrad)"
                        filter="url(#glow)"
                        fontFamily="Inter, sans-serif"
                        fontWeight="800"
                        fontSize="26"
                    >
                        B
                    </text>
                </svg>
            </div>

            {showName && (
                <div className="flex flex-col">
                    <span
                        className={`font-bold tracking-tight bg-gradient-to-r from-brand-400 via-neon-purple to-neon-cyan bg-clip-text text-transparent ${textClass}`}
                    >
                        BRUTSTeamPad
                    </span>
                    {size === 'lg' && (
                        <span className="text-xs text-white/40 font-medium -mt-0.5">
                            Collaborative Editor
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default Logo;
