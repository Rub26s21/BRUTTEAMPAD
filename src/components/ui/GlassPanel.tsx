/* ============================================
   BRUTSTeamPad — GlassPanel Component
   The foundational glass-morphism container
   ============================================ */
'use client';

import { motion } from 'framer-motion';
import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'flat' | 'subtle';
    neonBorder?: 'brand' | 'cyan' | 'purple' | 'pink' | 'none';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    animate?: boolean;
    children?: ReactNode;
}

const variantStyles: Record<string, string> = {
    default:
        'bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.15)] shadow-glass',
    elevated:
        'bg-[rgba(255,255,255,0.10)] backdrop-blur-[24px] border border-[rgba(255,255,255,0.18)] shadow-glass-lg',
    flat: 'bg-[rgba(255,255,255,0.05)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.10)]',
    subtle:
        'bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.06)]',
};

const neonBorderStyles: Record<string, string> = {
    brand: 'border-brand-500/30 hover:border-brand-400/50',
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan/50',
    purple: 'border-neon-purple/30 hover:border-neon-purple/50',
    pink: 'border-neon-pink/30 hover:border-neon-pink/50',
    none: '',
};

const paddingStyles: Record<string, string> = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
};

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
    (
        {
            variant = 'default',
            neonBorder = 'none',
            padding = 'md',
            animate = true,
            className = '',
            children,
            ...props
        },
        ref
    ) => {
        const baseClasses = `rounded-2xl transition-all duration-300 ${variantStyles[variant]} ${neonBorderStyles[neonBorder]} ${paddingStyles[padding]}`;

        if (!animate) {
            return (
                <div ref={ref} className={`${baseClasses} ${className}`}>
                    {children}
                </div>
            );
        }

        return (
            <motion.div
                ref={ref}
                className={`${baseClasses} ${className}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                {children}
            </motion.div>
        );
    }
);

GlassPanel.displayName = 'GlassPanel';

export default GlassPanel;
