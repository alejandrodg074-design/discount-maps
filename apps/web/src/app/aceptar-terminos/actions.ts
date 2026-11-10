'use server';

import { redirect } from 'next/navigation';
import type { AuthActionState } from '@org/ui';
import { LEGAL_VERSION } from '../../lib/legal';
import { safeNextForRole } from '../../lib/routing';
import { getSession } from '../../lib/session';

/**
 * Records that a signed-in user accepted the current terms: the same metadata
 * sign-up writes (`terms_version`, `terms_accepted_at`, proof of the Ley 1581
 * authorization). The session is refreshed so the new JWT carries the version
 * the proxy checks; otherwise the gate would send them back here.
 */
export async function acceptTermsAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (formData.get('acceptTerms') !== 'on') {
    return {
      fieldErrors: {
        acceptTerms: 'Debes aceptar los términos y la política de datos.',
      },
    };
  }
  const { supabase, userId, role } = await getSession();
  if (!userId) redirect('/login');

  const { error } = await supabase.auth.updateUser({
    data: {
      terms_version: LEGAL_VERSION,
      terms_accepted_at: new Date().toISOString(),
    },
  });
  if (error) {
    console.error('[legal] terms acceptance failed', error);
    return { error: 'No pudimos guardar tu aceptación. Intenta de nuevo.' };
  }
  await supabase.auth.refreshSession();
  redirect(safeNextForRole(formData.get('next'), role));
}
