import { BrandMark, buttonClassName } from '@org/ui';

/**
 * Landing for signed-out merchants ("Soy empresa" on `/`). Signed-in users are
 * sent to their home by proxy.ts.
 */
export default function BusinessLanding() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex flex-col items-center gap-3 text-center">
        <BrandMark className="size-24 text-ink" />
        <h1 className="text-4xl font-bold text-brand-600">Discount Maps</h1>
        <p className="text-lg text-ink-muted">
          Para empresas: publica cupones y verifica a tus clientes.
        </p>
      </div>

      <nav aria-label="Acceso empresas" className="flex w-full flex-col gap-3">
        <a
          href="/login?next=%2Fempresa%2Finicio"
          className={buttonClassName('primary', 'py-4 text-lg')}
        >
          Iniciar sesión
        </a>
        <a
          href="/empresa/registro"
          className={buttonClassName('secondary', 'py-4 text-lg')}
        >
          Registrar mi empresa
        </a>
        <p className="text-center text-sm text-ink-muted">
          ¿Buscas descuentos?{' '}
          <a href="/" className="font-semibold text-brand-600">
            Entra como persona
          </a>
          .
        </p>
      </nav>
    </main>
  );
}
