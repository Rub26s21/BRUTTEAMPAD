/* ============================================
   BRUTSTeamPad — API: Workspace Members
   Membership check & management
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

// GET /api/workspace/members?workspaceId=xxx
export async function GET(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
        return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    try {
        const { data: membership } = await supabase
            .from('workspace_members')
            .select('id, role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .single();

        if (!membership) {
            return NextResponse.json({ isMember: false, members: [] });
        }

        const { data: members } = await supabase
            .from('workspace_members')
            .select(`
                id,
                user_id,
                role,
                joined_at,
                profiles:user_id (
                    id,
                    email,
                    username,
                    avatar_url
                )
            `)
            .eq('workspace_id', workspaceId)
            .order('joined_at', { ascending: true });

        return NextResponse.json({
            isMember: true,
            role: membership.role,
            members: members || [],
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
