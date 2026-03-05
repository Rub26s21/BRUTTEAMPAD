/* ============================================
   BRUTSTeamPad — Motia Workflow: Team Key Validation
   Validates team keys and initializes workspaces
   ============================================ */

/**
 * Motia.dev Workflow: Team Key Validation
 *
 * Flow:
 * 1. Receive team key from client
 * 2. Normalize & validate format
 * 3. Check if workspace exists
 * 4. If not, create workspace + team key record
 * 5. Return workspace data
 */

interface TeamKeyValidationInput {
    teamKey: string;
    displayName: string;
}

interface TeamKeyValidationOutput {
    valid: boolean;
    workspace: {
        id: string;
        teamKey: string;
        name: string;
    } | null;
    isNew: boolean;
    error?: string;
}

// Step 1: Normalize and validate the team key format
export function validateFormat(input: TeamKeyValidationInput): {
    normalized: string;
    valid: boolean;
    error?: string;
} {
    const normalized = input.teamKey.toUpperCase().trim();

    if (!normalized || normalized.length < 3) {
        return {
            normalized,
            valid: false,
            error: 'Team key must be at least 3 characters',
        };
    }

    if (normalized.length > 100) {
        return {
            normalized,
            valid: false,
            error: 'Team key is too long',
        };
    }

    // Allow alphanumeric + hyphens
    if (!/^[A-Z0-9\-]+$/.test(normalized)) {
        return {
            normalized,
            valid: false,
            error: 'Team key can only contain letters, numbers, and hyphens',
        };
    }

    return { normalized, valid: true };
}

// Step 2: Lookup workspace by team key
export async function lookupWorkspace(
    teamKey: string,
    supabase: any
): Promise<{ exists: boolean; workspace: any | null }> {
    const { data, error } = await supabase
        .from('team_keys')
        .select('*, workspaces(*)')
        .eq('team_key', teamKey)
        .single();

    if (error || !data) {
        return { exists: false, workspace: null };
    }

    return { exists: true, workspace: data.workspaces };
}

// Step 3: Create new workspace
export async function createWorkspace(
    teamKey: string,
    supabase: any
): Promise<any> {
    const workspaceName = `Workspace ${teamKey}`;

    const { data: workspace, error: wsError } = await supabase
        .from('workspaces')
        .insert({ team_key: teamKey, name: workspaceName })
        .select()
        .single();

    if (wsError) throw new Error(`Failed to create workspace: ${wsError.message}`);

    await supabase.from('team_keys').insert({
        team_key: teamKey,
        workspace_id: workspace.id,
    });

    // Create a default "Welcome" document
    await supabase.from('documents').insert({
        workspace_id: workspace.id,
        title: 'Welcome to BRUTSTeamPad',
        content:
            '<h1>Welcome! 🎉</h1><p>This is your first document. Start editing and invite your team using the team key: <strong>' +
            teamKey +
            '</strong></p>',
    });

    return workspace;
}

// Full workflow orchestrator
export async function executeTeamKeyValidation(
    input: TeamKeyValidationInput,
    supabase: any
): Promise<TeamKeyValidationOutput> {
    // Step 1: Validate format
    const { normalized, valid, error } = validateFormat(input);
    if (!valid) {
        return { valid: false, workspace: null, isNew: false, error };
    }

    // Step 2: Lookup existing workspace
    const { exists, workspace: existingWorkspace } = await lookupWorkspace(
        normalized,
        supabase
    );

    if (exists) {
        return {
            valid: true,
            workspace: {
                id: existingWorkspace.id,
                teamKey: normalized,
                name: existingWorkspace.name,
            },
            isNew: false,
        };
    }

    // Step 3: Create new workspace
    const newWorkspace = await createWorkspace(normalized, supabase);

    return {
        valid: true,
        workspace: {
            id: newWorkspace.id,
            teamKey: normalized,
            name: newWorkspace.name,
        },
        isNew: true,
    };
}
