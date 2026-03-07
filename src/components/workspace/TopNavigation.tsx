/* ============================================
   BRUTSTeamPad — Top Navigation Bar
   ============================================ */
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    PanelLeftClose,
    PanelLeftOpen,
    MessageSquare,
    Save,
    LogOut,
    Home,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import {
    useAuthStore,
    useEditorStateStore,
    useUIStore,
    useSuggestionStore,
} from '@/lib/store';

export function TopNavigation() {
    const router = useRouter();
    const { workspace, user, logout } = useAuthStore();
    const displayName = user?.username || user?.email?.split('@')[0] || null;
    const { isSaving, lastSaved } = useEditorStateStore();
    const { sidebarOpen, toggleSidebar } = useUIStore();
    const { togglePanel: toggleSuggestions } = useSuggestionStore();

    const formatLastSaved = () => {
        if (!lastSaved) return null;
        const diff = Date.now() - lastSaved.getTime();
        if (diff < 5000) return 'Just saved';
        if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
        return `${Math.floor(diff / 60000)}m ago`;
    };

    return (
        <motion.header
            className="h-14 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.8)] backdrop-blur-[20px] z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
        >
            {/* Left section */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSidebar}
                    icon={sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
                    aria-label="Toggle sidebar"
                />
                <Logo size="sm" />
                {workspace && (
                    <>
                        <div className="w-px h-5 bg-white/10" />
                        <span className="text-sm text-white/50 font-medium">
                            {workspace.name}
                        </span>
                    </>
                )}
            </div>

            {/* Center: Save status */}
            <div className="flex items-center gap-3">
                {isSaving && (
                    <motion.div
                        className="flex items-center gap-1.5 text-xs text-white/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Save size={12} className="animate-pulse" />
                        Saving...
                    </motion.div>
                )}
                {!isSaving && lastSaved && (
                    <span className="text-xs text-white/30">{formatLastSaved()}</span>
                )}
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
                {/* Suggestions */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSuggestions}
                    icon={<MessageSquare size={14} />}
                >
                    Activity
                </Button>

                <div className="w-px h-5 bg-white/10" />

                {/* Dashboard link */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    icon={<Home size={14} />}
                    aria-label="Dashboard"
                />

                {/* User / Logout */}
                {displayName && (
                    <>
                        <span className="text-xs text-white/50">{displayName}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { logout(); router.push('/login'); }}
                            icon={<LogOut size={14} />}
                            aria-label="Leave workspace"
                        />
                    </>
                )}
            </div>
        </motion.header>
    );
}

export default TopNavigation;
