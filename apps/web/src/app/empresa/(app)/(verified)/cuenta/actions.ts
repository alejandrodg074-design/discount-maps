'use server';

import { revalidatePath } from 'next/cache';
import {
  branchSchema,
  businessProfileSchema,
  fieldErrorMap,
  MAX_BRANCHES,
  MIN_BRANCHES_ERROR,
  passwordChangeSchema,
  profileUpdateSchema,
} from '@org/domain';
import type { AuthActionState } from '@org/ui';
import { getOwnBusiness, getSession } from '../../../../../lib/business';
import {
  logoFileError,
  logoFromForm,
  uploadBusinessLogo,
} from '../../../../../lib/logo';

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
}

/** Company data (display name, legal name, NIT, category, description, logo). */
export async function updateBusinessAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { supabase } = await getSession();
  const business = await getOwnBusiness();
  if (!business) return { error: 'No encontramos tu empresa.' };

  const values = {
    legalName: text(formData, 'legalName'),
    displayName: text(formData, 'displayName'),
    nit: text(formData, 'nit'),
    category: text(formData, 'category'),
    description: text(formData, 'description'),
  };
  const parsed = businessProfileSchema.omit({ phone: true }).safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error), values };
  }

  const logo = logoFromForm(formData);
  const logoError = logo ? logoFileError(logo) : null;
  if (logoError) {
    return { values, fieldErrors: { logo: logoError } };
  }

  let logoPath = business.logo_path;
  if (logo) {
    const uploaded = await uploadBusinessLogo(supabase, business.id, logo);
    if ('error' in uploaded) {
      return { values, fieldErrors: { logo: uploaded.error } };
    }
    logoPath = uploaded.path;
  }

  const { error } = await supabase
    .from('businesses')
    .update({
      legal_name: parsed.data.legalName,
      display_name: parsed.data.displayName,
      nit: parsed.data.nit,
      category: parsed.data.category,
      description: parsed.data.description || null,
      logo_path: logoPath,
    })
    .eq('id', business.id);
  if (error) {
    return {
      error: 'No pudimos guardar los cambios. Intenta de nuevo.',
      values,
    };
  }
  revalidatePath('/empresa/cuenta');
  return { message: 'Datos de la empresa guardados.', values };
}

export async function addBranchAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { supabase } = await getSession();
  const business = await getOwnBusiness();
  if (!business) return { error: 'No encontramos tu empresa.' };

  const values = {
    name: text(formData, 'name'),
    addressLine: text(formData, 'addressLine'),
    city: text(formData, 'city'),
    lat: text(formData, 'lat'),
    lng: text(formData, 'lng'),
    phone: text(formData, 'phone'),
    googlePlaceId: text(formData, 'googlePlaceId'),
  };
  const parsed = branchSchema.safeParse({
    ...values,
    lat: Number(values.lat),
    lng: Number(values.lng),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error), values };
  }

  const { count } = await supabase
    .from('branches')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id);
  if ((count ?? 0) >= MAX_BRANCHES) {
    return { error: `Máximo ${MAX_BRANCHES} sedes.`, values };
  }

  const { error } = await supabase.rpc('add_branch', {
    p_business_id: business.id,
    p_name: parsed.data.name,
    p_address_line: parsed.data.addressLine,
    p_city: parsed.data.city,
    p_lat: parsed.data.lat,
    p_lng: parsed.data.lng,
    p_google_place_id: parsed.data.googlePlaceId || undefined,
    p_phone: parsed.data.phone || undefined,
  });
  if (error) {
    return { error: 'No pudimos guardar la sede. Revisa los datos.', values };
  }
  revalidatePath('/empresa/cuenta');
  return { message: 'Sede agregada.' };
}

export interface BranchActionResult {
  error?: string;
}

/** Deletes a branch; the `branches_min_one` trigger keeps the last one. */
export async function deleteBranchAction(
  branchId: string,
): Promise<BranchActionResult> {
  const { supabase } = await getSession();
  const business = await getOwnBusiness();
  if (!business) return { error: 'No encontramos tu empresa.' };
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', branchId)
    .eq('business_id', business.id);
  if (error) {
    return {
      error: error.message.includes(MIN_BRANCHES_ERROR)
        ? error.hint ||
          'Tu empresa necesita al menos una sede. Agrega otra antes de quitar esta.'
        : 'No pudimos quitar la sede. Intenta de nuevo.',
    };
  }
  revalidatePath('/empresa/cuenta');
  return {};
}

export async function updateProfileAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { supabase, userId } = await getSession();
  if (!userId) return { error: 'Inicia sesión para continuar.' };
  const values = {
    fullName: text(formData, 'fullName'),
    phone: text(formData, 'phone'),
  };
  const parsed = profileUpdateSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error), values };
  }
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq('id', userId);
  if (error) {
    return {
      error: 'No pudimos guardar los cambios. Intenta de nuevo.',
      values,
    };
  }
  revalidatePath('/empresa/cuenta');
  return { message: 'Datos guardados.', values };
}

export async function changePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { supabase, userId } = await getSession();
  if (!userId) return { error: 'Inicia sesión para continuar.' };
  const parsed = passwordChangeSchema.safeParse({
    password: text(formData, 'password'),
    confirm: text(formData, 'confirm'),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrorMap(parsed.error) };
  }
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return {
      error: /same|different/i.test(error.message)
        ? 'La nueva contraseña debe ser diferente a la actual.'
        : 'No pudimos cambiar la contraseña. Intenta de nuevo.',
    };
  }
  return { message: 'Contraseña actualizada.' };
}
