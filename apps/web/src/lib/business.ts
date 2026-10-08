import 'server-only';

import { cache } from 'react';
import type { Tables } from '@org/supabase';
import { getSession } from './session';

export { getSession };

export type Business = Tables<'businesses'>;

/** The business owned by the signed-in merchant, or null (memoized per render). */
export const getOwnBusiness = cache(async (): Promise<Business | null> => {
  const { supabase, userId } = await getSession();
  if (!userId) return null;
  const { data } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();
  return data ?? null;
});
