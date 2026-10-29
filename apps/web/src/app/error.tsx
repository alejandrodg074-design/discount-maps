'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { BrandMark, Button, PageShell } from '@org/ui';

/**
 * Safety net for unexpected errors in any page: a friendly Spanish screen with
 * "Intentar de nuevo" instead of Next.js' "Application error" message.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] unexpected error', error);
  }, [error]);

  return (
    <PageShell className="items-center justify-center gap-4 text-center">
      <BrandMark className="size-14 text-brand-500" />
      <h1 className="text-xl font-bold text-ink">Algo salió mal</h1>
      <p className="max-w-xs text-ink-muted">
        No pudimos completar lo que estabas haciendo. Revisa tu conexión e
        intenta de nuevo.
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button type="button" block onClick={reset}>
          Intentar de nuevo
        </Button>
        <Link href="/" className="py-2 text-sm font-semibold text-brand-600">
          Ir al inicio
        </Link>
      </div>
    </PageShell>
  );
}
