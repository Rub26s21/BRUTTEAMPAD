/* ============================================
   BRUTSTeamPad — Workspace Editor Page
   /workspace/[workspaceId] route
   ============================================ */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LoginPage } from '@/components/workspace/LoginPage';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { useAuthStore } from '@/lib/store';

export default function WorkspacePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const workspaceId = params.workspaceId as string;
    const teamKeyFromUrl = searchParams.get('key') || '';
    const { isAuthenticated, workspace } = useAuthStore();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(true);
    }, []);

    if (!ready) return null;

    // If not authenticated, show login with pre-filled team key
    if (!isAuthenticated || !workspace) {
        return <LoginPage prefilledTeamKey={teamKeyFromUrl} />;
    }

    return <WorkspaceLayout />;
}
