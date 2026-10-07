import { NextResponse } from 'next/server';
import { roleFromClaims } from '@org/supabase';
import { createServerSupabase } from '@org/supabase/server';
import { safeNextForRole } from '../../../lib/routing';

/**
 * OAuth / email-confirmation landing: exchanges the code for a session, then
 * redirects to `next` when it belongs to the user's area, else to their home.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const next = safeNextForRole(
        searchParams.get('next') ?? '/inicio',
        roleFromClaims(data.user),
      );
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
