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

async function getAuthUser(request: NextRequest) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return null;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
}

// GET /api/workspace/members?workspaceId=xxx
export async function GET(request: NextRequest) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaceId = request.nextUrl.searchParams.get('workspaceId');
    if (!workspaceId) {
        return NextResponse.json({ error: 'workspaceId required' }, { status: 400 });
    }

    try {
        // Check if user is a member
        const { data: membership } = await supabase
            .from('workspace_members')
            .select('id, role')
            .eq('workspace_id', workspaceId)
            .eq('user_id', user.id)
            .single();

        if (!membership) {
            return NextResponse.json({ isMember: false, members: [] });
        }

        // Get all members with profiles
        const { data: members, error: memError } = await supabase
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
