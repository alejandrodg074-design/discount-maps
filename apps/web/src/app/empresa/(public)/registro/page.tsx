import Link from 'next/link';
import { BackIcon, Brand, PageShell, SignupForm, TopBar } from '@org/ui';
import { businessSignupAction } from '../../../auth/actions';

/** Merchant sign-up: creates a business account, then /empresa/onboarding. */
export default function BusinessRegisterPage() {
  return (
    <PageShell>
      <TopBar
        left={
          <Link href="/empresa" aria-label="Volver" className="text-ink">
            <BackIcon />
          </Link>
        }
      />
      <Brand subtitle="Crea la cuenta del responsable. Luego registrarás tu empresa y sus sedes." />
      <SignupForm
        action={businessSignupAction}
        loginHref="/login?next=%2Fempresa%2Finicio"
        submitLabel="Continuar"
      />
      <p className="mt-6 text-center text-sm text-ink-muted">
        ¿Buscas descuentos?{' '}
        <Link href="/registro" className="font-semibold text-brand-600">
          Crea una cuenta de persona
        </Link>
      </p>
    </PageShell>
  );
}
