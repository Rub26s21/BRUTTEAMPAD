/* ============================================
   BRUTSTeamPad — Workspace Layout
   Main workspace view with sidebar, editor, panel
   ============================================ */
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TopNavigation } from '@/components/workspace/TopNavigation';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { DocumentEditor } from '@/components/editor/DocumentEditor';
import { SuggestionPanel } from '@/components/workspace/SuggestionPanel';
import { useUIStore, useSuggestionStore, useAuthStore } from '@/lib/store';

export function WorkspaceLayout() {
    const { sidebarOpen } = useUIStore();
    const { isPanelOpen } = useSuggestionStore();

    return (
        <div className="h-screen flex flex-col">
            {/* Top Nav */}
            <TopNavigation />

            {/* Main content area */}
            <div className="flex-1 flex min-h-0">
                {/* Left Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside
                            className="w-64 flex-shrink-0 border-r border-[rgba(255,255,255,0.08)] bg-[rgba(10,10,15,0.6)] backdrop-blur-[20px] flex flex-col"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 256, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {/* Documents list */}
                            <div className="flex-1 overflow-hidden">
                                <WorkspaceSidebar />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Center: Editor */}
                <main className="flex-1 flex flex-col min-w-0 bg-[rgba(10,10,15,0.3)]">
                    <DocumentEditor />
                </main>

                {/* Right Panel: Suggestions */}
                <AnimatePresence>
                    {isPanelOpen && <SuggestionPanel />}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default WorkspaceLayout;
