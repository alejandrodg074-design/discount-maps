'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  formatCop,
  formatDate,
  subscriptionStatusLabels,
  type SubscriptionStatus,
} from '@org/domain';
import { Button, buttonClassName, FormError, FormNotice } from '@org/ui';
import { cancelSubscriptionAction } from './actions';

export interface SubscriptionCardProps {
  status: SubscriptionStatus;
  cardBrand: string | null;
  cardLast4: string | null;
  /** False during the free week when no card was registered yet. */
  hasCard: boolean;
  /** End of the paid period / trial (what is kept after canceling). ISO. */
  accessUntil: string | null;
  nextChargeAt: string | null;
  trialEndsAt: string;
  /** Null when the deploy has no SUBSCRIPTION_PRICE_COP: copy omits the amount. */
  pricePesos: number | null;
  /** A payment is in flight (card just updated, or the hourly run charged it). */
  pendingCharge?: boolean;
  /** From `?tarjeta=ok|reactivada` after the card page. */
  notice?: string | null;
}

const STATUS_TONE: Record<SubscriptionStatus, string> = {
  trialing: 'bg-brand-50 text-brand-700',
  active: 'bg-success/10 text-success',
  past_due: 'bg-danger/10 text-danger',
  canceled: 'bg-surface-muted text-ink-muted',
};

function describe(p: SubscriptionCardProps): string {
  const until = formatDate(p.accessUntil);
  const amount = p.pricePesos == null ? '' : ` de ${formatCop(p.pricePesos)}`;
  const nextCharge = formatDate(p.nextChargeAt);
  switch (p.status) {
    case 'trialing':
      return p.hasCard
        ? `Tu semana gratis termina el ${formatDate(
            p.trialEndsAt,
          )}. Ese día haremos el primer cobro${amount}.`
        : `Tu semana gratis termina el ${formatDate(
            p.trialEndsAt,
          )}. Para seguir usando tus cupones después, agrega una tarjeta: el primer cobro${amount} será ese día.`;
    case 'active':
      return `Próximo cobro${amount}: ${nextCharge}.`;
    case 'past_due':
      if (p.pendingCharge) {
        return `Estamos procesando el cobro${amount}.`;
      }
      return `No pudimos cobrar tu tarjeta. Actualízala para seguir usando tus cupones; también lo volveremos a intentar el ${formatDate(
        p.nextChargeAt,
      )}.`;
    case 'canceled':
      return p.accessUntil && new Date(p.accessUntil).getTime() > Date.now()
        ? `No haremos más cobros. Puedes seguir usando tus cupones hasta el ${until}.`
        : `Tu suscripción terminó${until ? ` el ${until}` : ''}.`;
  }
}

export function SubscriptionCard(props: SubscriptionCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const canceled = props.status === 'canceled';
  // Free week without a card: nothing to cancel yet, the main action is adding one.
  const cardless = props.status === 'trialing' && !props.hasCard;

  const cancel = () =>
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (result.error) setError(result.error);
      else setConfirming(false);
    });

  return (
    <section
      aria-label="Suscripción"
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">Suscripción</h2>
        <span
          className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_TONE[props.status]}`}
          data-status={props.status}
        >
          {subscriptionStatusLabels[props.status]}
        </span>
      </div>
      <p className="text-sm text-ink-muted">{describe(props)}</p>
      {props.cardBrand || props.cardLast4 ? (
        <p className="text-sm text-ink">
          Tarjeta: <strong>{props.cardBrand ?? 'Tarjeta'}</strong>
          {props.cardLast4 ? ` •••• ${props.cardLast4}` : ''}
        </p>
      ) : (
        <p className="text-sm text-ink">Sin tarjeta registrada.</p>
      )}
      <FormNotice message={props.notice} />
      <FormError message={error} />

      <div className="flex flex-col gap-2">
        <Link
          href="/cuenta/tarjeta"
          className={buttonClassName(
            canceled || cardless ? 'primary' : 'secondary',
          )}
        >
          {canceled
            ? 'Reactivar suscripción'
            : cardless
              ? 'Agregar tarjeta'
              : 'Actualizar tarjeta'}
        </Link>
        {!canceled && !cardless && !confirming ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfirming(true)}
          >
            Cancelar suscripción
          </Button>
        ) : null}
        {!canceled && confirming ? (
          <div
            role="alertdialog"
            aria-label="Confirmar cancelación"
            className="flex flex-col gap-2 rounded-card bg-surface-muted p-3"
          >
            <p className="text-sm text-ink">
              No haremos más cobros. Podrás usar tus cupones hasta el{' '}
              <strong>{formatDate(props.accessUntil)}</strong>. ¿Quieres
              cancelar?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="danger"
                onClick={cancel}
                loading={pending}
              >
                Sí, cancelar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirming(false)}
                disabled={pending}
              >
                Volver
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
