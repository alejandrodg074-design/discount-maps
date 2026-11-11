import { Brand, NewPasswordForm, PageShell } from '@org/ui';
import { newPasswordAction } from '../auth/actions';

export const dynamic = 'force-dynamic';

/**
 * Landing of the recovery email: /auth/callback signs the user in, then sends
 * them here (`NEW_PASSWORD_PATH`, open to every role) to choose a password.
 */
export default function NewPasswordPage() {
  return (
    <PageShell>
      <Brand subtitle="Crea tu contraseña nueva." />
      <NewPasswordForm action={newPasswordAction} />
    </PageShell>
  );
}
