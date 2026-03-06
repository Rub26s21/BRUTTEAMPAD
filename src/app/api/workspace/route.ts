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

// GET /api/workspace — list all workspaces, or lookup by teamKey
export async function GET(request: NextRequest) {
    const teamKey = request.nextUrl.searchParams.get('teamKey');

    // If teamKey provided, lookup specific workspace
    if (teamKey) {
        const normalizedKey = teamKey.toUpperCase().trim();

        if (normalizedKey.length < 3 || normalizedKey.length > 100) {
            return NextResponse.json(
                { error: 'Invalid team key format' },
                { status: 400 }
            );
        }

        try {
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

            // Create new workspace for this key
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

            await supabase.from('team_keys').insert({
                team_key: normalizedKey,
                workspace_id: workspace.id,
            });

            return NextResponse.json({ workspace, isNew: true });
        } catch (error) {
            console.error('Workspace lookup error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    }

    // No teamKey — list all workspaces
    try {
        const { data, error } = await supabase
            .from('workspaces')
            .select('id, name, team_key, created_at')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { workspaces: [] },
                { status: 200 }
            );
        }

        return NextResponse.json({ workspaces: data || [] });
    } catch {
        return NextResponse.json({ workspaces: [] });
    }
}

// POST /api/workspace — create new workspace with generated team key
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, teamKey } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Workspace name is required' },
                { status: 400 }
            );
        }

        const finalKey = (teamKey || `BRUTS-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim();

        // Check if key already exists
        const { data: existing } = await supabase
            .from('workspaces')
            .select('id')
            .eq('team_key', finalKey)
            .single();

        if (existing) {
            // Generate a new key if collision
            const newKey = `BRUTS-${Math.floor(1000 + Math.random() * 9000)}`;
            return NextResponse.json(
                { error: `Key ${finalKey} already exists. Try again.` },
                { status: 409 }
            );
        }

        // Create workspace
        const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .insert({
                team_key: finalKey,
                name: name.trim(),
            })
            .select()
            .single();

        if (wsError) {
            console.error('Create workspace error:', wsError);
            return NextResponse.json(
                { error: 'Failed to create workspace: ' + wsError.message },
                { status: 500 }
            );
        }

        // Create team_keys entry
        await supabase.from('team_keys').insert({
            team_key: finalKey,
            workspace_id: workspace.id,
        });

        // Create welcome document
        await supabase.from('documents').insert({
            workspace_id: workspace.id,
            title: 'Welcome to BRUTSTeamPad',
            content:
                '<h1>Welcome! 🎉</h1><p>This is your first document. Share team key <strong>' +
                finalKey +
                '</strong> with your team to start collaborating!</p>',
        });

        return NextResponse.json({ workspace, teamKey: finalKey }, { status: 201 });
    } catch (error) {
        console.error('Create workspace error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
