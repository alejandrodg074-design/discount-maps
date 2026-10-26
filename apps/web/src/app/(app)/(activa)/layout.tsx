import { redirect } from 'next/navigation';
import { getConsumerAccess } from '../../../lib/billing';
import { getSession } from '../../../lib/session';

/**
 * Everything a consumer uses day to day (map, businesses, coupons, Contacto,
 * Cuenta) needs a subscription that is still in its trial / paid period. When
 * it lapsed (canceled and over, or unpaid past the grace days) the only screen
 * left is /cuenta/tarjeta to pay again. Admins are exempt.
 */
export default async function ActiveSubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await getSession();
  if (role !== 'admin') {
    const { entitled, pendingCharge } = await getConsumerAccess();
    if (!entitled && !pendingCharge) redirect('/cuenta/tarjeta');
  }
  return children;
}
