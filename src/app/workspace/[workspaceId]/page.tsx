/* ============================================
   BRUTSTeamPad — Workspace Page
   Auth check + workspace layout loader
   ============================================ */
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authFetch } from '@/lib/supabase';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';

export default function WorkspacePage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.workspaceId as string;
    const { user, isAuthenticated, isLoading: authLoading, setWorkspace, loadFromStorage } = useAuthStore();
    const [authorized, setAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);
    const hasChecked = useRef(false);

    // Load auth from localStorage on mount
    useEffect(() => {
        loadFromStorage();
    }, [loadFromStorage]);

    // Check access once auth is loaded
    useEffect(() => {
        // Wait for auth to finish loading
        if (authLoading) return;

        // Not authenticated → login
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        // Already checked → skip
        if (hasChecked.current) return;
        if (!workspaceId) return;

        hasChecked.current = true;

        const checkAccess = async () => {
            try {
                // First try member check
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
                    // Not a member but let's still try to load workspace
                    // (owner might not be in members table yet)
                    const wsRes = await authFetch('/api/workspace');
                    const wsData = await wsRes.json();
                    const ws = wsData.workspaces?.find(
                        (w: any) => w.id === workspaceId
                    );
                    if (ws) {
                        setWorkspace(ws);
                        setAuthorized(true);
                    } else {
                        router.push('/');
                    }
                }
            } catch {
                // On error, still try to show workspace
                setAuthorized(true);
            } finally {
                setChecking(false);
            }
        };

        checkAccess();
    }, [authLoading, isAuthenticated, workspaceId, router, setWorkspace]);

    if (authLoading || checking) {
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

    if (!authorized) {
        return null;
    }

    return <WorkspaceLayout />;
}
