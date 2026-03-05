/* ============================================
   BRUTSTeamPad — Motia Workflow: Workspace Documents
   Document retrieval & management operations
   ============================================ */

/**
 * Motia.dev Workflow: Workspace Document Operations
 *
 * Provides:
 * 1. List all documents in a workspace
 * 2. Get document with content
 * 3. Create new document
 * 4. Rename document
 * 5. Delete document
 * 6. Search documents
 */

interface DocumentCreateInput {
    workspaceId: string;
    title: string;
    initialContent?: string;
}

interface DocumentSearchInput {
    workspaceId: string;
    query: string;
}

// List all documents for a workspace
export async function listDocuments(
    workspaceId: string,
    supabase: any
): Promise<any[]> {
    const { data, error } = await supabase
        .from('documents')
        .select('id, workspace_id, title, created_at, updated_at')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to list documents: ${error.message}`);
    return data || [];
}

// Get full document with content
export async function getDocumentFull(
    documentId: string,
    supabase: any
): Promise<any> {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

    if (error) throw new Error(`Document not found: ${error.message}`);
    return data;
}

// Create a new document
export async function createNewDocument(
    input: DocumentCreateInput,
    supabase: any
): Promise<any> {
    const sanitizedTitle = input.title
        .replace(/<[^>]*>/g, '')
        .trim()
        .slice(0, 500);

    const { data, error } = await supabase
        .from('documents')
        .insert({
            workspace_id: input.workspaceId,
            title: sanitizedTitle || 'Untitled Document',
            content: input.initialContent || '',
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return data;
}

// Rename a document
export async function renameDocument(
    documentId: string,
    newTitle: string,
    supabase: any
): Promise<void> {
    const sanitizedTitle = newTitle.replace(/<[^>]*>/g, '').trim().slice(0, 500);

    const { error } = await supabase
        .from('documents')
        .update({ title: sanitizedTitle || 'Untitled Document' })
        .eq('id', documentId);

    if (error) throw new Error(`Failed to rename document: ${error.message}`);
}

// Delete a document
export async function deleteDocument(
    documentId: string,
    supabase: any
): Promise<void> {
    // Delete versions first (cascade should handle this, but be safe)
    await supabase
        .from('document_versions')
        .delete()
        .eq('document_id', documentId);

    await supabase
        .from('suggestions')
        .delete()
        .eq('document_id', documentId);

    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
}

// Search documents by title
export async function searchDocuments(
    input: DocumentSearchInput,
    supabase: any
): Promise<any[]> {
    const { data, error } = await supabase
        .from('documents')
        .select('id, workspace_id, title, created_at, updated_at')
        .eq('workspace_id', input.workspaceId)
        .ilike('title', `%${input.query}%`)
        .order('updated_at', { ascending: false })
        .limit(20);

    if (error) throw new Error(`Search failed: ${error.message}`);
    return data || [];
}
