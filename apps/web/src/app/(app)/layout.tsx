import { redirect } from 'next/navigation';
import { getOwnSubscription } from '../../lib/billing';
import { getSession } from '../../lib/session';

/**
 * Signed-in consumer area. proxy.ts already gates the session; this is defense
 * in depth for server rendering plus the trial gate: a consumer without a
 * subscription row (first entry) is sent to /suscripcion/tarjeta, which opens
 * the free week without a card.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, role } = await getSession();
  if (!userId) redirect('/login');
  if (role !== 'admin') {
    const subscription = await getOwnSubscription();
    if (!subscription) redirect('/suscripcion/tarjeta');
  }
  return children;
}
