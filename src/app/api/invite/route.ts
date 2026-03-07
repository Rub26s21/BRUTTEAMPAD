/* ============================================
   BRUTSTeamPad — API: Invite Operations
   Lookup & join workspace via invite code
   ============================================ */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getUserId(request: NextRequest): string | null {
    return request.headers.get('X-User-Id');
}

// GET /api/invite?code=BRUTS-8472
export async function GET(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = request.nextUrl.searchParams.get('code');
    if (!code) {
        return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
    }

    try {
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('id, name, team_key, owner_id, created_at')
            .eq('team_key', code.toUpperCase().trim())
            .single();

        if (wsError || !workspace) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        }

        const { data: member } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', workspace.id)
            .eq('user_id', userId)
            .single();

        return NextResponse.json({
            workspace,
            alreadyMember: !!member,
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/invite — Join workspace
export async function POST(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
        }

        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('id, name')
            .eq('team_key', code.toUpperCase().trim())
            .single();

        if (wsError || !workspace) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
        }

        const { data: existing } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', workspace.id)
            .eq('user_id', userId)
            .single();

        if (existing) {
            return NextResponse.json({
                workspace_id: workspace.id,
                message: 'Already a member',
            });
        }

        const { error: memberError } = await supabase
            .from('workspace_members')
            .insert({
                workspace_id: workspace.id,
                user_id: userId,
                role: 'member',
            });

        if (memberError) {
            return NextResponse.json(
                { error: 'Failed to join: ' + memberError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            workspace_id: workspace.id,
            message: 'Joined successfully',
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
