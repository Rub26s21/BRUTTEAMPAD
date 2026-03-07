/* ============================================
   BRUTSTeamPad — Login API
   Simple email+mobile login (no verification)
   ============================================ */
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { email, mobile } = await request.json();

        if (!email || !mobile) {
            return NextResponse.json(
                { error: 'Email and mobile number are required' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedMobile = mobile.trim();

        // Check if profile exists
        const { data: existing } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

        if (existing) {
            // Update mobile if changed
            if (existing.mobile !== normalizedMobile) {
                await supabase
                    .from('profiles')
                    .update({ mobile: normalizedMobile })
                    .eq('id', existing.id);
                existing.mobile = normalizedMobile;
            }
            return NextResponse.json({ profile: existing });
        }

        // Create new profile
        const username = normalizedEmail.split('@')[0];
        const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
                email: normalizedEmail,
                mobile: normalizedMobile,
                username,
            })
            .select()
            .single();

        if (createError) {
            console.error('Create profile error:', createError);
            return NextResponse.json(
                { error: 'Failed to create profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({ profile: newProfile });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
