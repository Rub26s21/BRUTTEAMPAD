/* ============================================
   BRUTSTeamPad — API: Document Operations
   Next.js Route Handler
   ============================================ */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/documents?workspaceId=xxx
export async function GET(request: NextRequest) {
    const workspaceId = request.nextUrl.searchParams.get('workspaceId');

    if (!workspaceId) {
        return NextResponse.json(
            { error: 'Workspace ID is required' },
            { status: 400 }
        );
    }

    try {
        const { data, error } = await supabase
            .from('documents')
            .select('id, workspace_id, title, created_at, updated_at')
            .eq('workspace_id', workspaceId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ documents: data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}

// POST /api/documents
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { workspaceId, title } = body;

        if (!workspaceId) {
            return NextResponse.json(
                { error: 'Workspace ID is required' },
                { status: 400 }
            );
        }

        // Sanitize title
        const sanitizedTitle = (title || 'Untitled Document')
            .replace(/<[^>]*>/g, '')
            .trim()
            .slice(0, 500);

        const { data, error } = await supabase
            .from('documents')
            .insert({
                workspace_id: workspaceId,
                title: sanitizedTitle,
                content: '',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ document: data }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create document' },
            { status: 500 }
        );
    }
}

// PATCH /api/documents
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, title, content } = body;

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        const updates: Record<string, any> = {};
        if (title !== undefined) {
            updates.title = title.replace(/<[^>]*>/g, '').trim().slice(0, 500);
        }
        if (content !== undefined) {
            updates.content = content;
        }

        const { data, error } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', documentId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ document: data });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update document' },
            { status: 500 }
        );
    }
}

// DELETE /api/documents?id=xxx
export async function DELETE(request: NextRequest) {
    const documentId = request.nextUrl.searchParams.get('id');

    if (!documentId) {
        return NextResponse.json(
            { error: 'Document ID is required' },
            { status: 400 }
        );
    }

    try {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete document' },
            { status: 500 }
        );
    }
}
