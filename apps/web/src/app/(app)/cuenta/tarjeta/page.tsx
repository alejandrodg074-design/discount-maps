import Link from 'next/link';
import { redirect } from 'next/navigation';
import { formatCop } from '@org/domain';
import { BackIcon, Button, EmptyState, PageShell, TopBar } from '@org/ui';
import { CardForm } from '../../../../components/card-form';
import {
  getCardCaptureData,
  getConsumerAccess,
  subscriptionPricePesos,
} from '../../../../lib/billing';
import { signOutAction } from '../../../auth/actions';
import { updateCardAction } from './actions';

export const dynamic = 'force-dynamic';

/**
 * Update the card, or reactivate. When the subscription lapsed this is the only
 * screen the consumer can reach (see `(activa)/layout.tsx`), so it has no back
 * link and offers "Cerrar sesión" instead.
 */
export default async function UpdateCardPage() {
  const { subscription, entitled, pendingCharge } = await getConsumerAccess();
  if (!subscription) redirect('/suscripcion/tarjeta');
  const lapsed = !entitled && !pendingCharge;
  const reactivating = lapsed || subscription.status === 'canceled';
  const { tokens, tokenizationKey, apiUrl, publicKey } =
    await getCardCaptureData();
  // Only shown with the form; tokens != null guarantees the price is configured.
  const price = tokens ? formatCop(subscriptionPricePesos()) : '';

  let intro: React.ReactNode;
  if (lapsed) {
    intro = (
      <>
        Tu suscripción no está activa. Registra una tarjeta para seguir usando
        Discount Maps: cobraremos <strong>{price}</strong> ahora y luego cada
        mes. Puedes cancelar cuando quieras.
      </>
    );
  } else if (reactivating) {
    intro = (
      <>
        Registra una tarjeta para volver a usar tus cupones. Cobraremos{' '}
        <strong>{price}</strong> al mes; si tu periodo pagado aún no termina, el
        primer cobro será al final de ese periodo.
      </>
    );
  } else {
    intro = (
      <>
        Reemplazaremos la tarjeta actual. Los cobros de <strong>{price}</strong>{' '}
        al mes seguirán en las mismas fechas
        {subscription.status === 'past_due'
          ? ', y reintentaremos el cobro pendiente de inmediato'
          : ''}
        .
      </>
    );
  }

  return (
    <PageShell>
      <TopBar
        title={reactivating ? 'Reactivar suscripción' : 'Actualizar tarjeta'}
        left={
          lapsed ? undefined : (
            <Link href="/cuenta" aria-label="Volver" className="text-ink">
              <BackIcon />
            </Link>
          )
        }
      />
      {tokens ? (
        <CardForm
          apiUrl={apiUrl}
          publicKey={publicKey}
          tokenizationKey={tokenizationKey}
          acceptance={{
            token: tokens.presigned_acceptance.acceptance_token,
            permalink: tokens.presigned_acceptance.permalink,
          }}
          personalData={{
            token: tokens.presigned_personal_data_auth.acceptance_token,
            permalink: tokens.presigned_personal_data_auth.permalink,
          }}
          action={updateCardAction}
          submitLabel={
            reactivating ? 'Reactivar suscripción' : 'Guardar tarjeta'
          }
          intro={
            <p className="rounded-card bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {intro}
            </p>
          }
        />
      ) : (
        <EmptyState
          title="La pasarela de pagos no responde"
          description="Intenta de nuevo en unos minutos."
        />
      )}
      {lapsed ? (
        <form action={signOutAction} className="mt-8">
          <Button type="submit" variant="ghost" block>
            Cerrar sesión
          </Button>
        </form>
      ) : null}
    </PageShell>
  );
}
