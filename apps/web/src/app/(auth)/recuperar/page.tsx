import Link from 'next/link';
import {
  BackIcon,
  Brand,
  ForgotPasswordForm,
  PageShell,
  TopBar,
} from '@org/ui';
import { forgotPasswordAction } from '../../auth/actions';

/** "¿Olvidaste tu contraseña?" (personas and empresas): sends the recovery link. */
export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <TopBar
        left={
          <Link href="/login" aria-label="Volver" className="text-ink">
            <BackIcon />
          </Link>
        }
      />
      <Brand subtitle="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva." />
      <ForgotPasswordForm action={forgotPasswordAction} loginHref="/login" />
    </PageShell>
  );
}
