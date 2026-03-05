/* ============================================
   BRUTSTeamPad — Database Migration Script
   Run Supabase migrations
   
   Usage: node scripts/migrate.mjs
   ============================================ */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    console.error('');
    console.error('Set them in .env.local or export them before running.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigrations() {
    const migrationsDir = resolve(process.cwd(), 'supabase/migrations');

    console.log('');
    console.log('╔══════════════════════════════════════╗');
    console.log('║  BRUTSTeamPad Database Migrations    ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('');

    let files;
    try {
        files = readdirSync(migrationsDir)
            .filter((f) => f.endsWith('.sql'))
            .sort();
    } catch {
        console.error(`❌ Migrations directory not found: ${migrationsDir}`);
        process.exit(1);
    }

    if (files.length === 0) {
        console.log('No migration files found.');
        return;
    }

    console.log(`Found ${files.length} migration file(s):\n`);

    for (const file of files) {
        const filePath = join(migrationsDir, file);
        const sql = readFileSync(filePath, 'utf-8');

        console.log(`  📄 Running: ${file}...`);

        try {
            const { error } = await supabase.rpc('exec_sql', { sql_text: sql });

            if (error) {
                // Fallback: try executing via REST if rpc doesn't work
                console.log(`  ⚠️  RPC not available. Copy & paste the SQL into Supabase SQL Editor.`);
                console.log(`  📋 File: ${filePath}`);
            } else {
                console.log(`  ✅ ${file} — applied successfully`);
            }
        } catch (err) {
            console.log(`  ⚠️  Could not auto-run migration.`);
            console.log(`  📋 Please run the SQL manually in Supabase Dashboard > SQL Editor`);
            console.log(`  📄 File: ${filePath}`);
        }
    }

    console.log('');
    console.log('💡 Tip: If migrations fail to auto-run, copy the SQL from');
    console.log('   supabase/migrations/ and execute in Supabase SQL Editor.');
    console.log('');
}

runMigrations().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
