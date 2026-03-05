/* ============================================
   BRUTSTeamPad — API: Autosave Endpoint
   Periodic document persistence
   ============================================ */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/autosave
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { documentId, content, userId } = body;

        if (!documentId || content === undefined) {
            return NextResponse.json(
                { error: 'Document ID and content are required' },
                { status: 400 }
            );
        }

        // Update document content
        const { error: updateError } = await supabase
            .from('documents')
            .update({
                content,
                updated_at: new Date().toISOString(),
            })
            .eq('id', documentId);

        if (updateError) throw updateError;

        // Create version snapshot (every ~5 minutes, tracked by caller)
        if (body.createSnapshot) {
            await supabase.from('document_versions').insert({
                document_id: documentId,
                content_snapshot: content,
                created_by: userId || 'autosave',
            });
        }

        return NextResponse.json({
            success: true,
            savedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Autosave error:', error);
        return NextResponse.json(
            { error: 'Autosave failed' },
            { status: 500 }
        );
    }
}
