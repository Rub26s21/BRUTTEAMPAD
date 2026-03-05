/* ============================================
   BRUTSTeamPad — Suggestion Panel
   Right sidebar for suggestions & activity
   ============================================ */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Check,
    X,
    Clock,
    User,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useSuggestionStore } from '@/lib/store';
import { updateSuggestionStatus } from '@/lib/supabase-api';
import { getRandomCursorColor } from '@/lib/types';

export function SuggestionPanel() {
    const { suggestions, isPanelOpen, updateSuggestion } = useSuggestionStore();

    if (!isPanelOpen) return null;

    const handleAccept = async (id: string) => {
        try {
            await updateSuggestionStatus(id, 'accepted');
            updateSuggestion(id, { status: 'accepted' });
        } catch (error) {
            console.error('Failed to accept suggestion:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await updateSuggestionStatus(id, 'rejected');
            updateSuggestion(id, { status: 'rejected' });
        } catch (error) {
            console.error('Failed to reject suggestion:', error);
        }
    };

    return (
        <motion.div
            className="w-72 h-full border-l border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] backdrop-blur-[20px] flex flex-col"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Panel Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-brand-400" />
                    <h3 className="text-sm font-semibold text-white/80">
                        Suggestions & Activity
                    </h3>
                </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {suggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center mb-3">
                            <MessageSquare size={18} className="text-white/15" />
                        </div>
                        <p className="text-xs text-white/25">No suggestions yet</p>
                        <p className="text-[10px] text-white/15 mt-1">
                            Suggestions will appear here
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {suggestions.map((suggestion) => {
                            const statusColors = {
                                pending: 'border-yellow-500/20 bg-yellow-500/5',
                                accepted: 'border-neon-green/20 bg-neon-green/5',
                                rejected: 'border-red-500/20 bg-red-500/5',
                            };

                            const statusIcons = {
                                pending: <Clock size={12} className="text-yellow-400" />,
                                accepted: <Check size={12} className="text-neon-green" />,
                                rejected: <X size={12} className="text-red-400" />,
                            };

                            return (
                                <motion.div
                                    key={suggestion.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-3 rounded-xl border ${statusColors[suggestion.status]}`}
                                >
                                    {/* Author */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <Avatar
                                            name={suggestion.author}
                                            color={getRandomCursorColor()}
                                            size="sm"
                                        />
                                        <span className="text-xs font-medium text-white/70">
                                            {suggestion.author}
                                        </span>
                                        <span className="ml-auto flex items-center gap-1 text-[10px] text-white/30">
                                            {statusIcons[suggestion.status]}
                                            {suggestion.status}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <p className="text-xs text-white/60 mb-2">
                                        {suggestion.content}
                                    </p>

                                    {/* Original → Suggested */}
                                    {suggestion.original_text && (
                                        <div className="space-y-1 mb-2">
                                            <div className="flex items-start gap-1.5">
                                                <span className="text-[10px] text-red-400/60 mt-0.5 flex-shrink-0">
                                                    −
                                                </span>
                                                <span className="text-[11px] text-red-400/70 line-through">
                                                    {suggestion.original_text}
                                                </span>
                                            </div>
                                            <div className="flex items-start gap-1.5">
                                                <span className="text-[10px] text-neon-green/60 mt-0.5 flex-shrink-0">
                                                    +
                                                </span>
                                                <span className="text-[11px] text-neon-green/70">
                                                    {suggestion.suggested_text}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {suggestion.status === 'pending' && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleAccept(suggestion.id)}
                                                icon={<Check size={12} />}
                                                className="text-neon-green hover:bg-neon-green/10"
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleReject(suggestion.id)}
                                                icon={<X size={12} />}
                                                className="text-red-400 hover:bg-red-500/10"
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}

export default SuggestionPanel;
