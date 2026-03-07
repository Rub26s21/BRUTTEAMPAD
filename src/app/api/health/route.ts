/* ============================================
   BRUTSTeamPad — API: Health Check
   Verifies database tables exist
   ============================================ */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    const checks: Record<string, string> = {};

    const tables = ['profiles', 'workspaces', 'workspace_members', 'team_keys', 'documents', 'document_versions', 'user_sessions', 'suggestions'];

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                checks[table] = `❌ ERROR: ${error.message}`;
            } else {
                checks[table] = `✅ OK (${count ?? 0} rows)`;
            }
        } catch (err: any) {
            checks[table] = `❌ EXCEPTION: ${err.message}`;
        }
    }

    // Check owner_id column on workspaces
    try {
        const { data, error } = await supabase
            .from('workspaces')
            .select('owner_id')
            .limit(1);

        if (error) {
            checks['workspaces.owner_id'] = `❌ MISSING: ${error.message}`;
        } else {
            checks['workspaces.owner_id'] = '✅ Column exists';
        }
    } catch (err: any) {
        checks['workspaces.owner_id'] = `❌ ${err.message}`;
    }

    // Check mobile column on profiles
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('mobile')
            .limit(1);

        if (error) {
            checks['profiles.mobile'] = `❌ MISSING: ${error.message}`;
        } else {
            checks['profiles.mobile'] = '✅ Column exists';
        }
    } catch (err: any) {
        checks['profiles.mobile'] = `❌ ${err.message}`;
    }

    const allOk = Object.values(checks).every((v) => v.startsWith('✅'));

    return NextResponse.json({
        status: allOk ? 'HEALTHY' : 'ISSUES',
        checks,
        message: allOk
            ? 'All tables and columns are set up correctly!'
            : 'Some tables/columns are missing. Run the full_setup.sql in Supabase SQL Editor.',
    });
}
