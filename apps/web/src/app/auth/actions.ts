'use server';

import { redirect } from 'next/navigation';
import { consumerSignupSchema, fieldErrorMap, loginSchema } from '@org/domain';
import { roleFromClaims } from '@org/supabase';
import { createServerSupabase } from '@org/supabase/server';
import type { AuthActionState } from '@org/ui';
import { CONSUMER_HOME, safeNextForRole } from '../../lib/routing';

/** Where a new merchant goes right after creating the account. */
const BUSINESS_ONBOARDING = '/empresa/onboarding';

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

/**
 * One login for every account. After signing in, the user goes to `next` when
 * it belongs to their area, otherwise to their home (consumer → /mapas,
 * merchant → /empresa/inicio, admin → /admin).
 */
export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error) };
  }
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: 'Correo o contraseña incorrectos.' };
  }
  redirect(safeNextForRole(formData.get('next'), roleFromClaims(data.user)));
}

type SignupRole = 'consumer' | 'business';

async function signUp(
  formData: FormData,
  role: SignupRole,
): Promise<AuthActionState> {
  const parsed = consumerSignupSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error) };
  }
  const destination = role === 'business' ? BUSINESS_ONBOARDING : CONSUMER_HOME;
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, role },
      emailRedirectTo: `${appUrl()}/auth/callback?next=${destination}`,
    },
  });
  if (error) {
    return {
      error: /registered|exists/i.test(error.message)
        ? 'Ya existe una cuenta con este correo.'
        : 'No pudimos crear tu cuenta. Intenta de nuevo.',
    };
  }
  if (!data.session) {
    // Email confirmation is enabled on the project: the callback signs the user in.
    redirect('/login?mensaje=confirma');
  }
  redirect(destination);
}

/** Consumer ("Persona") sign-up from /registro. */
export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  return signUp(formData, 'consumer');
}

/**
 * Merchant ("Empresa") sign-up from /empresa/registro: creates the owner's
 * account with role = business. Company details, branches and logo are
 * collected right after, in /empresa/onboarding.
 */
export async function businessSignupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  return signUp(formData, 'business');
}

/** Google sign-in / sign-up. New Google accounts are always consumers. */
export async function googleAction(): Promise<void> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${appUrl()}/auth/callback?next=/inicio` },
  });
  if (error || !data.url) {
    redirect('/login?error=google');
  }
  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/');
}
