import { redirect } from 'next/navigation';
import { homeForRole } from '../../../lib/routing';
import { getSession } from '../../../lib/session';

/**
 * Neutral entry point (auth callbacks, Google sign-in and the installed app's
 * start URL land here). Sends each role to its home. Merchants never reach this
 * page: proxy.ts already sends them to /empresa/inicio.
 */
export default async function HomePage() {
  const { role } = await getSession();
  redirect(homeForRole(role));
}
