import { redirect } from 'next/navigation';
import { cardlessTrial } from '@org/domain';
import { createAdminSupabase } from '@org/supabase/server';
import { CONSUMER_HOME } from '../../../../lib/routing';
import { getSession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * First entry of a consumer: opens the free week without asking for a card
 * (owner, 2026-10-29) and goes to the map. The card is asked when the week
 * ends, on /cuenta/tarjeta (the `(activa)` gate sends lapsed consumers there),
 * or earlier from Cuenta → "Agregar tarjeta". The path is kept because the
 * consumer gates already redirect here when there is no subscription row.
 * The row is written with the service role (RLS forbids consumers).
 */
export default async function StartTrialPage() {
  const { userId, email, role } = await getSession();
  if (!userId) redirect('/login');
  // A missing role claim means consumer (the default role): never loop back here.
  if (role !== 'business' && role !== 'admin') {
    const trial = cardlessTrial(new Date());
    const admin = createAdminSupabase();
    const { error } = await admin.from('subscriptions').insert({
      consumer_id: userId,
      status: trial.status,
      trial_ends_at: trial.trial_ends_at.toISOString(),
      next_charge_at: null,
      wompi_customer_email: email ?? '',
    });
    // 23505: unique consumer_id, the row already exists (double request).
    if (error && error.code !== '23505') {
      console.error('[billing] trial insert failed', error);
      throw new Error('TRIAL_START_FAILED');
    }
  }
  redirect(CONSUMER_HOME);
}
