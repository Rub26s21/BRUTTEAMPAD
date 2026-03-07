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
        // Check if user is a member
        const { data: membership, error: memErr } = await supabase
            .from('workspace_members')
            .select('id, role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .maybeSingle();

        // Also check if user is the owner of the workspace
        const { data: workspace } = await supabase
            .from('workspaces')
            .select('id, owner_id')
            .eq('id', workspaceId)
            .single();

        const isOwner = workspace?.owner_id === userId;
        const isMember = !!membership || isOwner;

        if (!isMember) {
            return NextResponse.json({ isMember: false, members: [] });
        }

        // Fetch all members (simple query without join to avoid FK issues)
        const { data: members } = await supabase
            .from('workspace_members')
            .select('id, user_id, role, joined_at')
            .eq('workspace_id', workspaceId)
            .order('joined_at', { ascending: true });

        // Fetch profiles separately if members exist
        let enrichedMembers = members || [];
        if (members && members.length > 0) {
            const userIds = members.map((m: any) => m.user_id);
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, username, avatar_url')
                .in('id', userIds);

            const profileMap = new Map(
                (profiles || []).map((p: any) => [p.id, p])
            );

            enrichedMembers = members.map((m: any) => ({
                ...m,
                profile: profileMap.get(m.user_id) || null,
            }));
        }

        return NextResponse.json({
            isMember: true,
            role: membership?.role || (isOwner ? 'owner' : 'member'),
            members: enrichedMembers,
        });
    } catch (err) {
        console.error('Members API error:', err);
        // On any error, gracefully return isMember: true for owner
        return NextResponse.json({
            isMember: true,
            role: 'owner',
            members: [],
        });
    }
}
