import { redirect } from 'next/navigation';
import { CONSUMER_HOME } from '../../../lib/routing';
import { getSession } from '../../../lib/session';

/**
 * Signed-in merchant area (`/empresa/*` except the public landing and sign-up).
 * proxy.ts already gates; this is defense in depth for server rendering:
 * a session is required and consumers are sent back to their own area.
 */
export default async function BusinessAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, role } = await getSession();
  if (!userId) redirect('/login?next=%2Fempresa%2Finicio');
  if (role === 'consumer') redirect(CONSUMER_HOME);
  return children;
}
