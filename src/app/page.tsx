/* ============================================
   BRUTSTeamPad — Home Page
   Entry point: Login or Workspace
   ============================================ */
'use client';

import { LoginPage } from '@/components/workspace/LoginPage';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { useAuthStore } from '@/lib/store';

export default function Home() {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    return <WorkspaceLayout />;
}
