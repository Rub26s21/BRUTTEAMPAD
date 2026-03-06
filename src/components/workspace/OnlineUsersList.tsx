/* ============================================
   BRUTSTeamPad — Online Users List
   Real-time presence tracking with Supabase
   ============================================ */
'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useOnlineStore } from '@/lib/store';
import { getRandomCursorColor } from '@/lib/types';
import type { OnlineUser } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function OnlineUsersList({ workspaceId }: { workspaceId: string }) {
    const { user, cursorColor } = useAuthStore();
    const { onlineUsers, setOnlineUsers } = useOnlineStore();

    const syncPresence = useCallback(
        (channel: RealtimeChannel) => {
            const state = channel.presenceState<OnlineUser>();
            const users: OnlineUser[] = [];
            const seen = new Set<string>();

            for (const key of Object.keys(state)) {
                for (const presence of state[key]) {
                    if (!seen.has(presence.user_id)) {
                        seen.add(presence.user_id);
                        users.push(presence);
                    }
                }
            }

            setOnlineUsers(users);
        },
        [setOnlineUsers]
    );

    useEffect(() => {
        if (!user || !workspaceId) return;

        const channel = supabase.channel(`workspace-presence:${workspaceId}`, {
            config: { presence: { key: user.id } },
        });

        channel
            .on('presence', { event: 'sync' }, () => syncPresence(channel))
            .on('presence', { event: 'join' }, () => syncPresence(channel))
            .on('presence', { event: 'leave' }, () => syncPresence(channel))
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: user.id,
                        username: user.username || user.email.split('@')[0],
                        email: user.email,
                        online_at: new Date().toISOString(),
                        cursor_color: cursorColor,
                    });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, workspaceId, cursorColor, syncPresence]);

    return (
        <div className="px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
                <Wifi size={12} className="text-neon-green/60" />
                <span className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">
                    Online ({onlineUsers.length})
                </span>
            </div>
            <div className="space-y-1">
                <AnimatePresence>
                    {onlineUsers.map((ou) => (
                        <motion.div
                            key={ou.user_id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ backgroundColor: ou.cursor_color || getRandomCursorColor() }}
                            >
                                {(ou.username || ou.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white/70 truncate">
                                    {ou.username || ou.email.split('@')[0]}
                                </p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default OnlineUsersList;
