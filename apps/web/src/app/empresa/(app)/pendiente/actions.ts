'use server';

import { revalidatePath } from 'next/cache';
import type { AuthActionState } from '@org/ui';
import { getOwnBusiness, getSession } from '../../../../lib/business';
import {
  logoFileError,
  logoFromForm,
  uploadBusinessLogo,
} from '../../../../lib/logo';

/**
 * Logo upload while the business waits for verification (the Cuenta screen is
 * only for verified businesses). Also the way back when the logo picked at
 * registration did not save.
 */
export async function uploadPendingLogoAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { supabase, role } = await getSession();
  if (role !== 'business') {
    return { error: 'Solo las cuentas de empresa pueden subir un logo.' };
  }
  const business = await getOwnBusiness();
  if (!business) return { error: 'Primero registra tu empresa.' };

  const logo = logoFromForm(formData);
  if (!logo) return { fieldErrors: { logo: 'Elige una imagen.' } };
  const logoError = logoFileError(logo);
  if (logoError) return { fieldErrors: { logo: logoError } };

  const uploaded = await uploadBusinessLogo(supabase, business.id, logo);
  if ('error' in uploaded) return { fieldErrors: { logo: uploaded.error } };
  revalidatePath('/empresa/pendiente');
  return { message: 'Logo guardado.' };
}
