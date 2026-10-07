import { redirect } from 'next/navigation';
import { getSession } from '../../lib/session';

/** Admin area. proxy.ts already gates; the page itself 404s for non-admins. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await getSession();
  if (!userId) redirect('/login?next=%2Fadmin');
  return children;
}
