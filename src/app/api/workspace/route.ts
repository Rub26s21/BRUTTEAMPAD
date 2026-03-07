/* ============================================
   BRUTSTeamPad — API: Workspace Operations
   Simple auth via X-User-Id header
   ============================================ */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple auth: get user_id from header
function getUserId(request: NextRequest): string | null {
    return request.headers.get('X-User-Id');
}

// GET /api/workspace — list user's workspaces
export async function GET(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Try workspace_members first
        const { data: memberships, error: memError } = await supabase
            .from('workspace_members')
            .select('workspace_id, role')
            .eq('user_id', userId);

        if (memError) {
            console.error('workspace_members query error:', memError.message);
            // Fall back to workspaces owned by user
            const { data: ownedWs } = await supabase
                .from('workspaces')
                .select('*')
                .eq('owner_id', userId)
                .order('created_at', { ascending: false });

            return NextResponse.json({
                workspaces: (ownedWs || []).map((ws) => ({ ...ws, role: 'owner' })),
            });
        }

        const wsIds = memberships?.map((m) => m.workspace_id) || [];

        if (wsIds.length === 0) {
            return NextResponse.json({ workspaces: [] });
        }

        const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id, name, team_key, owner_id, created_at')
            .in('id', wsIds)
            .order('created_at', { ascending: false });

        const enriched = (workspaces || []).map((ws) => ({
            ...ws,
            role: memberships?.find((m) => m.workspace_id === ws.id)?.role || 'member',
        }));

        return NextResponse.json({ workspaces: enriched });
    } catch (err: any) {
        console.error('GET /api/workspace error:', err);
        return NextResponse.json({ workspaces: [], error: err.message });
    }
}

// POST /api/workspace — create new workspace
export async function POST(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Not logged in. Please refresh and log in again.' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, teamKey } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Workspace name is required' },
                { status: 400 }
            );
        }

        // Verify user exists in profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            console.error('Profile lookup failed:', profileError?.message);
            return NextResponse.json(
                { error: 'User profile not found. Please log out and log back in.' },
                { status: 404 }
            );
        }

        const finalKey = (teamKey || `BRUTS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`)
            .toUpperCase().trim();

        // Create workspace
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .insert({
                team_key: finalKey,
                name: name.trim(),
                owner_id: userId,
            })
            .select()
            .single();

        if (wsError) {
            console.error('Workspace insert error:', wsError.message, wsError.details, wsError.hint);
            return NextResponse.json(
                { error: 'Failed to create workspace: ' + wsError.message },
                { status: 500 }
            );
        }

        // Add creator as owner member
        const { error: memberError } = await supabase.from('workspace_members').insert({
            workspace_id: workspace.id,
            user_id: userId,
            role: 'owner',
        });

        if (memberError) {
            console.error('Member insert error:', memberError.message);
            // Don't fail — workspace was already created
        }

        // Create team_keys entry
        const { error: tkError } = await supabase.from('team_keys').insert({
            team_key: finalKey,
            workspace_id: workspace.id,
        });

        if (tkError) {
            console.error('team_keys insert error:', tkError.message);
            // Don't fail — workspace was already created
        }

        // Create welcome document
        const { error: docError } = await supabase.from('documents').insert({
            workspace_id: workspace.id,
            title: 'Welcome to BRUTSTeamPad',
            content: `<h1>Welcome! 🎉</h1><p>This is your first document. Share invite code <strong>${finalKey}</strong> with your team to start collaborating!</p>`,
        });

        if (docError) {
            console.error('Document insert error:', docError.message);
        }

        return NextResponse.json({ workspace, teamKey: finalKey }, { status: 201 });
    } catch (err: any) {
        console.error('POST /api/workspace error:', err);
        return NextResponse.json(
            { error: 'Server error: ' + (err.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
