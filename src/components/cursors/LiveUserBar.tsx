/* ============================================
   BRUTSTeamPad — Live User Bar
   Real-time connected users display
   ============================================ */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users } from 'lucide-react';
import { UserBadge } from '@/components/ui/Avatar';
import { useCollaborationStore } from '@/lib/store';

export function LiveUserBar() {
    const { connectedUsers, isConnected } = useCollaborationStore();

    if (connectedUsers.length === 0) return null;

    return (
        <motion.div
            className="flex items-center gap-2 px-4 py-2 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
        >
            <div className="flex items-center gap-1.5 text-white/30">
                <Users size={13} />
                <span className="text-[11px] font-medium">
                    {connectedUsers.length} editing
                </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5 flex-wrap">
                <AnimatePresence>
                    {connectedUsers.map((user) => (
                        <UserBadge
                            key={user.id}
                            name={user.name}
                            color={user.color}
                            isOnline={user.isOnline}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default LiveUserBar;
