/* ============================================
   BRUTSTeamPad — Avatar & User Badge
   ============================================ */
'use client';

import { motion } from 'framer-motion';

interface AvatarProps {
    name: string;
    color: string;
    size?: 'sm' | 'md' | 'lg';
    showOnline?: boolean;
    className?: string;
}

const sizeStyles = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
};

export function Avatar({
    name,
    color,
    size = 'md',
    showOnline = false,
    className = '',
}: AvatarProps) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={`relative inline-flex ${className}`}>
            <motion.div
                className={`${sizeStyles[size]} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-[rgba(0,0,0,0.3)]`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                title={name}
            >
                {initials}
            </motion.div>
            {showOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-neon-green rounded-full border-2 border-surface" />
            )}
        </div>
    );
}

interface UserBadgeProps {
    name: string;
    color: string;
    isOnline?: boolean;
}

export function UserBadge({ name, color, isOnline = true }: UserBadgeProps) {
    return (
        <motion.div
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
        >
            <Avatar name={name} color={color} size="sm" showOnline={isOnline} />
            <span className="text-xs font-medium text-white/80">{name}</span>
        </motion.div>
    );
}

interface AvatarStackProps {
    users: Array<{ name: string; color: string }>;
    max?: number;
}

export function AvatarStack({ users, max = 5 }: AvatarStackProps) {
    const visible = users.slice(0, max);
    const overflow = users.length - max;

    return (
        <div className="flex items-center -space-x-2">
            {visible.map((user, i) => (
                <Avatar
                    key={user.name + i}
                    name={user.name}
                    color={user.color}
                    size="sm"
                    showOnline
                    className="ring-2 ring-surface"
                />
            ))}
            {overflow > 0 && (
                <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[10px] font-medium text-white/60 ring-2 ring-surface">
                    +{overflow}
                </div>
            )}
        </div>
    );
}

export default Avatar;
