/* ============================================
   BRUTSTeamPad — Motia Workflow: Document Autosave
   Debounced persistence pipeline
   ============================================ */

/**
 * Motia.dev Workflow: Document Autosave Pipeline
 *
 * Flow:
 * 1. Receive content update from editor
 * 2. Debounce: wait for 10s of inactivity
 * 3. Diff check: skip if content unchanged
 * 4. Save to database
 * 5. Conditionally create version snapshot
 */

interface AutosaveInput {
    documentId: string;
    content: string;
    userId: string;
    timestamp: number;
}

interface AutosaveResult {
    saved: boolean;
    snapshotCreated: boolean;
    savedAt: string | null;
    error?: string;
}

// Track last save times for version snapshot logic
const lastSnapshotTimes = new Map<string, number>();
const SNAPSHOT_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Step 1: Check if content has actually changed
export async function checkDirty(
    documentId: string,
    newContent: string,
    supabase: any
): Promise<boolean> {
    const { data } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single();

    if (!data) return true; // Document not found, save anyway
    return data.content !== newContent;
}

// Step 2: Persist content to database
export async function persistContent(
    documentId: string,
    content: string,
    supabase: any
): Promise<void> {
    const { error } = await supabase
        .from('documents')
        .update({
            content,
            updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

    if (error) {
        throw new Error(`Failed to save document: ${error.message}`);
    }
}

// Step 3: Conditionally create version snapshot
export async function maybeCreateSnapshot(
    documentId: string,
    content: string,
    userId: string,
    supabase: any
): Promise<boolean> {
    const now = Date.now();
    const lastSnapshot = lastSnapshotTimes.get(documentId) || 0;

    if (now - lastSnapshot < SNAPSHOT_INTERVAL) {
        return false;
    }

    const { error } = await supabase.from('document_versions').insert({
        document_id: documentId,
        content_snapshot: content,
        created_by: userId,
    });

    if (error) {
        console.error('Failed to create snapshot:', error.message);
        return false;
    }

    lastSnapshotTimes.set(documentId, now);
    return true;
}

// Full workflow orchestrator
export async function executeAutosave(
    input: AutosaveInput,
    supabase: any
): Promise<AutosaveResult> {
    try {
        // Step 1: Dirty check
        const isDirty = await checkDirty(input.documentId, input.content, supabase);
        if (!isDirty) {
            return {
                saved: false,
                snapshotCreated: false,
                savedAt: null,
            };
        }

        // Step 2: Save
        await persistContent(input.documentId, input.content, supabase);

        // Step 3: Snapshot
        const snapshotCreated = await maybeCreateSnapshot(
            input.documentId,
            input.content,
            input.userId,
            supabase
        );

        return {
            saved: true,
            snapshotCreated,
            savedAt: new Date().toISOString(),
        };
    } catch (error: any) {
        return {
            saved: false,
            snapshotCreated: false,
            savedAt: null,
            error: error.message,
        };
    }
}
