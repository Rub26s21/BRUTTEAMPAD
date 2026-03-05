/* ============================================
   BRUTSTeamPad — Button Components
   Glass and Neon button variants
   ============================================ */
'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'glass' | 'neon' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    isLoading?: boolean;
}

const variantStyles: Record<string, string> = {
    glass:
        'bg-[rgba(255,255,255,0.08)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] text-white',
    neon: 'bg-gradient-to-r from-brand-600 to-neon-purple border border-brand-500/40 hover:shadow-neon-lg text-white font-semibold',
    ghost:
        'bg-transparent border border-transparent hover:bg-[rgba(255,255,255,0.06)] text-white/70 hover:text-white',
    danger:
        'bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 text-red-400',
};

const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'glass',
            size = 'md',
            icon,
            isLoading = false,
            className = '',
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                className={`inline-flex items-center justify-center font-medium transition-all duration-300 
          ${variantStyles[variant]} ${sizeStyles[size]} 
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}`}
                whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                ) : icon ? (
                    <span className="flex-shrink-0">{icon}</span>
                ) : null}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
