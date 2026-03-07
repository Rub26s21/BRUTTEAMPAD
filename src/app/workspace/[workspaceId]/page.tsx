/* ============================================
   BRUTSTeamPad — Workspace Page
   Auth check + workspace layout loader
   ============================================ */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authFetch } from '@/lib/supabase';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';

export default function WorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId as string;
    const { user, isAuthenticated, setUser, setWorkspace, loadFromStorage } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    useEffect(() => {
        if (!isAuthenticated && !checking) {
            router.push('/login');
            return;
        }

        if (!isAuthenticated || !workspaceId) return;

        const checkAccess = async () => {
            try {
                const res = await authFetch(
                    `/api/workspace/members?workspaceId=${workspaceId}`
                );
                const data = await res.json();

                if (data.isMember) {
                    // Fetch workspace details
                    const wsRes = await authFetch('/api/workspace');
                    const wsData = await wsRes.json();
                    const ws = wsData.workspaces?.find(
                        (w: any) => w.id === workspaceId
                    );
                    if (ws) setWorkspace(ws);
                    setAuthorized(true);
                } else {
                    router.push('/');
                }
            } catch {
                router.push('/');
            } finally {
                setChecking(false);
            }
        };

        checkAccess();
    }, [isAuthenticated, workspaceId, router, setWorkspace, loadFromStorage, checking]);

    if (checking || !authorized) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a0a1a',
                    color: 'rgba(255,255,255,0.4)',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #c44dff, #ff6b9d)',
                            margin: '0 auto 16px',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                    <p>Loading workspace...</p>
                </div>
            </div>
        );
    }

    return <WorkspaceLayout />;
}
