/* ============================================
   BRUTSTeamPad — API: Workspace Operations
   Next.js Route Handler
   ============================================ */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/workspace?teamKey=BRUTS-2026
export async function GET(request: NextRequest) {
    const teamKey = request.nextUrl.searchParams.get('teamKey');

    if (!teamKey) {
        return NextResponse.json(
            { error: 'Team key is required' },
            { status: 400 }
        );
    }

    const normalizedKey = teamKey.toUpperCase().trim();

    // Validate team key format
    if (normalizedKey.length < 3 || normalizedKey.length > 100) {
        return NextResponse.json(
            { error: 'Invalid team key format' },
            { status: 400 }
        );
    }

    try {
        // Look up existing workspace
        const { data: tkData } = await supabase
            .from('team_keys')
            .select('*, workspaces(*)')
            .eq('team_key', normalizedKey)
            .single();

        if (tkData) {
            return NextResponse.json({
                workspace: tkData.workspaces,
                isNew: false,
            });
        }

        // Create new workspace
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .insert({
                team_key: normalizedKey,
                name: `Workspace ${normalizedKey}`,
            })
            .select()
            .single();

        if (wsError) {
            return NextResponse.json(
                { error: 'Failed to create workspace' },
                { status: 500 }
            );
        }

        // Create team key link
        await supabase.from('team_keys').insert({
            team_key: normalizedKey,
            workspace_id: workspace.id,
        });

        return NextResponse.json({
            workspace,
            isNew: true,
        });
    } catch (error) {
        console.error('Workspace API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
