import { Brand, Button, PageShell } from '@org/ui';
import { signOutAction } from '../auth/actions';
import { getSession } from '../../lib/session';
import { AcceptTermsForm } from './accept-form';
import { acceptTermsAction } from './actions';

export const dynamic = 'force-dynamic';

/**
 * Shown by the proxy (`gateRedirect`) to consumers and merchants who have not
 * accepted the current `LEGAL_VERSION` — accounts created before the terms
 * existed, or after a material change. Businesses get their own terms, which
 * include the marketing authorization.
 */
export default async function AcceptTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { role } = await getSession();
  const { next } = await searchParams;
  const business = role === 'business';

  return (
    <PageShell className="justify-center">
      <Brand />
      <div className="flex flex-col gap-4 rounded-card border border-line p-6">
        <h1 className="text-xl font-semibold text-ink">
          Actualizamos nuestros términos
        </h1>
        <p className="text-sm text-ink-muted">
          {business
            ? 'Para seguir usando Discount Maps con tu empresa, lee y acepta los Términos para empresas. Incluyen la autorización para mostrar tu marca y tu negocio en nuestras redes sociales y piezas de marketing.'
            : 'Para seguir usando Discount Maps, lee y acepta los Términos y condiciones y la Política de datos.'}
        </p>
        <AcceptTermsForm
          action={acceptTermsAction}
          next={next ?? ''}
          termsHref={business ? '/terminos-empresas' : '/terminos'}
          termsLabel={
            business
              ? 'Términos para empresas (incluye la autorización de uso de mi marca en marketing)'
              : 'Términos y condiciones'
          }
        />
      </div>
      <form action={signOutAction} className="mt-8">
        <Button type="submit" variant="ghost" block>
          Cerrar sesión
        </Button>
      </form>
    </PageShell>
  );
}
