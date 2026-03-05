/* ============================================
   BRUTSTeamPad — Motia Workflow: Suggestion Processing
   Handles edit suggestions from collaborators
   ============================================ */

/**
 * Motia.dev Workflow: Suggestion Processing
 *
 * Flow:
 * 1. Receive suggestion from a collaborator
 * 2. Validate suggestion content
 * 3. Store suggestion in database
 * 4. Notify connected users via realtime
 * 5. On accept/reject: apply or discard changes
 */

interface SuggestionInput {
    documentId: string;
    author: string;
    originalText: string;
    suggestedText: string;
    content: string;
}

interface SuggestionActionInput {
    suggestionId: string;
    action: 'accept' | 'reject';
    documentId: string;
}

// Step 1: Validate suggestion
export function validateSuggestion(input: SuggestionInput): {
    valid: boolean;
    error?: string;
} {
    if (!input.documentId) {
        return { valid: false, error: 'Document ID is required' };
    }
    if (!input.author || input.author.trim().length === 0) {
        return { valid: false, error: 'Author name is required' };
    }
    if (!input.suggestedText && !input.content) {
        return { valid: false, error: 'Suggestion content cannot be empty' };
    }
    // Sanitize: strip HTML tags from suggestion text
    const sanitized = input.suggestedText.replace(/<[^>]*>/g, '');
    if (sanitized.length > 5000) {
        return { valid: false, error: 'Suggestion text is too long' };
    }
    return { valid: true };
}

// Step 2: Create suggestion record
export async function createSuggestion(
    input: SuggestionInput,
    supabase: any
): Promise<any> {
    const { data, error } = await supabase
        .from('suggestions')
        .insert({
            document_id: input.documentId,
            author: input.author.trim(),
            content: input.content,
            original_text: input.originalText,
            suggested_text: input.suggestedText.replace(/<[^>]*>/g, ''),
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw new Error(`Failed to create suggestion: ${error.message}`);
    return data;
}

// Step 3: Process suggestion action (accept/reject)
export async function processSuggestionAction(
    input: SuggestionActionInput,
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    // Update suggestion status
    const { error: updateError } = await supabase
        .from('suggestions')
        .update({ status: input.action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', input.suggestionId);

    if (updateError) {
        return { success: false, error: updateError.message };
    }

    // If accepted, the client-side editor applies the change via Yjs
    // The document content will be synced automatically through CRDT

    return { success: true };
}

// Full workflow orchestrator
export async function executeSuggestionWorkflow(
    input: SuggestionInput,
    supabase: any
): Promise<{ success: boolean; suggestion?: any; error?: string }> {
    // Validate
    const validation = validateSuggestion(input);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    // Create
    try {
        const suggestion = await createSuggestion(input, supabase);
        return { success: true, suggestion };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
