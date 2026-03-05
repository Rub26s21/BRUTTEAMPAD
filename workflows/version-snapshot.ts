/* ============================================
   BRUTSTeamPad — Motia Workflow: Version Snapshots
   Document history & versioning
   ============================================ */

/**
 * Motia.dev Workflow: Version Snapshots
 *
 * Flow:
 * 1. Triggered periodically or on-demand
 * 2. Capture current document state
 * 3. Store as versioned snapshot
 * 4. Prune old snapshots beyond retention limit
 */

interface VersionSnapshotInput {
    documentId: string;
    content: string;
    createdBy: string;
}

interface VersionListInput {
    documentId: string;
    limit?: number;
}

const MAX_VERSIONS_PER_DOCUMENT = 100;

// Create a new version snapshot
export async function createVersionSnapshot(
    input: VersionSnapshotInput,
    supabase: any
): Promise<{ id: string; timestamp: string }> {
    const { data, error } = await supabase
        .from('document_versions')
        .insert({
            document_id: input.documentId,
            content_snapshot: input.content,
            created_by: input.createdBy,
        })
        .select('id, timestamp')
        .single();

    if (error) {
        throw new Error(`Failed to create version snapshot: ${error.message}`);
    }

    return data;
}

// Get version history for a document
export async function getVersionHistory(
    input: VersionListInput,
    supabase: any
): Promise<
    Array<{
        id: string;
        created_by: string;
        timestamp: string;
        content_length: number;
    }>
> {
    const limit = input.limit || 50;

    const { data, error } = await supabase
        .from('document_versions')
        .select('id, created_by, timestamp, content_snapshot')
        .eq('document_id', input.documentId)
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (error) {
        throw new Error(`Failed to fetch version history: ${error.message}`);
    }

    return (data || []).map((v: any) => ({
        id: v.id,
        created_by: v.created_by,
        timestamp: v.timestamp,
        content_length: v.content_snapshot?.length || 0,
    }));
}

// Restore a specific version
export async function restoreVersion(
    documentId: string,
    versionId: string,
    supabase: any
): Promise<string> {
    // Get the version content
    const { data: version, error: vError } = await supabase
        .from('document_versions')
        .select('content_snapshot')
        .eq('id', versionId)
        .single();

    if (vError || !version) {
        throw new Error('Version not found');
    }

    // Save current state as a new snapshot before restoring
    const { data: currentDoc } = await supabase
        .from('documents')
        .select('content')
        .eq('id', documentId)
        .single();

    if (currentDoc?.content) {
        await supabase.from('document_versions').insert({
            document_id: documentId,
            content_snapshot: currentDoc.content,
            created_by: 'auto-backup-before-restore',
        });
    }

    // Restore the document
    const { error: updateError } = await supabase
        .from('documents')
        .update({
            content: version.content_snapshot,
            updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

    if (updateError) {
        throw new Error(`Failed to restore version: ${updateError.message}`);
    }

    return version.content_snapshot;
}

// Prune old versions beyond retention limit
export async function pruneVersions(
    documentId: string,
    supabase: any
): Promise<number> {
    // Get versions ordered by timestamp
    const { data: versions } = await supabase
        .from('document_versions')
        .select('id')
        .eq('document_id', documentId)
        .order('timestamp', { ascending: false });

    if (!versions || versions.length <= MAX_VERSIONS_PER_DOCUMENT) {
        return 0;
    }

    // Delete oldest versions
    const toDelete = versions.slice(MAX_VERSIONS_PER_DOCUMENT);
    const ids = toDelete.map((v: any) => v.id);

    const { error } = await supabase
        .from('document_versions')
        .delete()
        .in('id', ids);

    if (error) {
        console.error('Failed to prune versions:', error.message);
        return 0;
    }

    return ids.length;
}
