/**
 * How the admin "Usuarios" screen groups consumers by what they owe. Pure, so
 * it is tested next to the billing rules it summarises.
 */

import { subscriptionAccessUntil, type SubscriptionLike } from './subscription';

export type BillingGroup = 'debe_pagar' | 'prueba' | 'pagando' | 'inactivo';

export interface BillingViewInput extends SubscriptionLike {
  next_charge_at: string | Date | null;
}

export interface BillingView {
  group: BillingGroup;
  /** What the date means, in Spanish ("Primer cobro", "Reintento"…). */
  label: string;
  date: Date | null;
}

/** Display order on the screen. */
export const BILLING_GROUPS: { id: BillingGroup; title: string }[] = [
  { id: 'debe_pagar', title: 'Deberían pagar ya' },
  { id: 'prueba', title: 'En semana gratis (pagan pronto)' },
  { id: 'pagando', title: 'Pagando' },
  { id: 'inactivo', title: 'Sin suscripción activa' },
];

function toDate(value: string | Date | null | undefined): Date | null {
  if (value == null) return null;
  return value instanceof Date ? value : new Date(value);
}

export function billingView(
  s: BillingViewInput | null,
  now: Date = new Date(),
): BillingView {
  if (!s) {
    return {
      group: 'inactivo',
      label: 'Aún no ha entrado a la app',
      date: null,
    };
  }
  const hasCard = s.wompi_payment_source_id != null;
  const trialEnd = toDate(s.trial_ends_at);
  switch (s.status) {
    case 'trialing':
      if (trialEnd && trialEnd.getTime() > now.getTime()) {
        return {
          group: 'prueba',
          label: hasCard
            ? 'Primer cobro automático'
            : 'Termina la semana gratis (se le pedirá tarjeta)',
          date: trialEnd,
        };
      }
      return hasCard
        ? { group: 'prueba', label: 'Primer cobro en proceso', date: trialEnd }
        : {
            group: 'debe_pagar',
            label: 'Semana gratis terminada sin tarjeta',
            date: trialEnd,
          };
    case 'active':
      return {
        group: 'pagando',
        label: 'Próximo cobro',
        date: toDate(s.next_charge_at) ?? toDate(s.current_period_end),
      };
    case 'past_due':
      return {
        group: 'debe_pagar',
        label: 'Cobro fallido · próximo reintento',
        date: toDate(s.next_charge_at),
      };
    case 'canceled': {
      const until = subscriptionAccessUntil(s);
      return until && until.getTime() > now.getTime()
        ? { group: 'inactivo', label: 'Canceló · acceso hasta', date: until }
        : { group: 'inactivo', label: 'Suscripción terminada', date: until };
    }
  }
}
