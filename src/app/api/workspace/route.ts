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
        const { data: memberships } = await supabase
            .from('workspace_members')
            .select('workspace_id, role')
            .eq('user_id', userId);

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
    } catch {
        return NextResponse.json({ workspaces: [] });
    }
}

// POST /api/workspace — create new workspace
export async function POST(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        const finalKey = (teamKey || `BRUTS-${Math.floor(1000 + Math.random() * 9000)}`)
            .toUpperCase().trim();

        // Check for key collision
        const { data: existing } = await supabase
            .from('workspaces')
            .select('id')
            .eq('team_key', finalKey)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: `Key ${finalKey} taken. Try again.` },
                { status: 409 }
            );
        }

        // Create workspace with owner
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
            return NextResponse.json(
                { error: 'Failed to create workspace: ' + wsError.message },
                { status: 500 }
            );
        }

        // Add creator as owner member
        await supabase.from('workspace_members').insert({
            workspace_id: workspace.id,
            user_id: userId,
            role: 'owner',
        });

        // Create team_keys entry
        await supabase.from('team_keys').insert({
            team_key: finalKey,
            workspace_id: workspace.id,
        });

        // Create welcome document
        await supabase.from('documents').insert({
            workspace_id: workspace.id,
            title: 'Welcome to BRUTSTeamPad',
            content: `<h1>Welcome! 🎉</h1><p>This is your first document. Share invite code <strong>${finalKey}</strong> with your team to start collaborating!</p>`,
        });

        return NextResponse.json({ workspace, teamKey: finalKey }, { status: 201 });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
