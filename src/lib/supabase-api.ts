/* ============================================
   BRUTSTeamPad — Supabase API Operations
   ============================================ */
import { supabase } from './supabase';
import type { Workspace, Document, DocumentVersion, Suggestion } from './types';

// ---- Workspace Operations ----

export async function validateTeamKey(
    teamKey: string
): Promise<Workspace | null> {
    const { data, error } = await supabase
        .from('team_keys')
        .select('*, workspaces(*)')
        .eq('team_key', teamKey.toUpperCase().trim())
        .single();

    if (error || !data) return null;
    return data.workspaces as Workspace;
}

export async function createWorkspace(
    teamKey: string,
    name?: string
): Promise<Workspace> {
    const normalizedKey = teamKey.toUpperCase().trim();
    const workspaceName = name || `Workspace ${normalizedKey}`;

    // Create workspace
    const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ team_key: normalizedKey, name: workspaceName })
        .select()
        .single();

    if (wsError) throw new Error(`Failed to create workspace: ${wsError.message}`);

    // Create team key record
    const { error: tkError } = await supabase
        .from('team_keys')
        .insert({
            team_key: normalizedKey,
            workspace_id: workspace.id,
        });

    if (tkError) throw new Error(`Failed to create team key: ${tkError.message}`);

    return workspace;
}

export async function getOrCreateWorkspace(
    teamKey: string
): Promise<Workspace> {
    const existing = await validateTeamKey(teamKey);
    if (existing) return existing;
    return createWorkspace(teamKey);
}

// ---- Document Operations ----

export async function getDocuments(
    workspaceId: string
): Promise<Document[]> {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);
    return data || [];
}

export async function getDocument(
    documentId: string
): Promise<Document | null> {
    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

    if (error) return null;
    return data;
}

export async function createDocument(
    workspaceId: string,
    title: string = 'Untitled Document'
): Promise<Document> {
    const { data, error } = await supabase
        .from('documents')
        .insert({
            workspace_id: workspaceId,
            title,
            content: '',
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create document: ${error.message}`);
    return data;
}

export async function updateDocument(
    documentId: string,
    updates: Partial<Pick<Document, 'title' | 'content'>>
): Promise<Document> {
    const { data, error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update document: ${error.message}`);
    return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

    if (error) throw new Error(`Failed to delete document: ${error.message}`);
}

export async function renameDocument(
    documentId: string,
    title: string
): Promise<Document> {
    return updateDocument(documentId, { title });
}

// ---- Document Versioning ----

export async function createVersionSnapshot(
    documentId: string,
    content: string,
    createdBy: string
): Promise<DocumentVersion> {
    const { data, error } = await supabase
        .from('document_versions')
        .insert({
            document_id: documentId,
            content_snapshot: content,
            created_by: createdBy,
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create version: ${error.message}`);
    return data;
}

export async function getDocumentVersions(
    documentId: string
): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('timestamp', { ascending: false })
        .limit(50);

    if (error) throw new Error(`Failed to fetch versions: ${error.message}`);
    return data || [];
}

// ---- Suggestion Operations ----

export async function createSuggestion(
    documentId: string,
    author: string,
    originalText: string,
    suggestedText: string,
    content: string
): Promise<Suggestion> {
    const { data, error } = await supabase
        .from('suggestions')
        .insert({
            document_id: documentId,
            author,
            content,
            original_text: originalText,
            suggested_text: suggestedText,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create suggestion: ${error.message}`);
    return data;
}

export async function getSuggestions(
    documentId: string
): Promise<Suggestion[]> {
    const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch suggestions: ${error.message}`);
    return data || [];
}

export async function updateSuggestionStatus(
    suggestionId: string,
    status: 'accepted' | 'rejected'
): Promise<void> {
    const { error } = await supabase
        .from('suggestions')
        .update({ status })
        .eq('id', suggestionId);

    if (error)
        throw new Error(`Failed to update suggestion: ${error.message}`);
}

// ---- Image Upload ----

export async function uploadImage(
    workspaceId: string,
    documentId: string,
    file: File
): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${workspaceId}/${documentId}/${fileName}`;

    const { error } = await supabase.storage
        .from('brutsteampad-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) throw new Error(`Failed to upload image: ${error.message}`);

    const {
        data: { publicUrl },
    } = supabase.storage.from('brutsteampad-images').getPublicUrl(filePath);

    return publicUrl;
}

// ---- User Sessions ----

export async function registerUserSession(
    workspaceId: string,
    displayName: string,
    cursorColor: string
): Promise<string> {
    const { data, error } = await supabase
        .from('user_sessions')
        .insert({
            workspace_id: workspaceId,
            display_name: displayName,
            cursor_color: cursorColor,
            is_online: true,
            last_seen: new Date().toISOString(),
        })
        .select('id')
        .single();

    if (error) throw new Error(`Failed to register session: ${error.message}`);
    return data.id;
}

export async function updateUserOnlineStatus(
    sessionId: string,
    isOnline: boolean
): Promise<void> {
    await supabase
        .from('user_sessions')
        .update({
            is_online: isOnline,
            last_seen: new Date().toISOString(),
        })
        .eq('id', sessionId);
}

export async function getOnlineUsers(
    workspaceId: string
): Promise<
    Array<{ id: string; display_name: string; cursor_color: string }>
> {
    const { data, error } = await supabase
        .from('user_sessions')
        .select('id, display_name, cursor_color')
        .eq('workspace_id', workspaceId)
        .eq('is_online', true);

    if (error) return [];
    return data || [];
}
