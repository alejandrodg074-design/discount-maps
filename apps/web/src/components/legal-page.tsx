import Link from 'next/link';
import type { ReactNode } from 'react';
import { BackIcon, PageShell, TopBar } from '@org/ui';
import { LEGAL_UPDATED_ON } from '../lib/legal';

/**
 * Layout of the long legal texts (`/terminos`, `/privacidad`): numbered
 * sections with readable type. Public pages, open to every role.
 */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <TopBar
        left={
          <Link href="/" aria-label="Volver" className="text-ink">
            <BackIcon />
          </Link>
        }
      />
      <article className="flex flex-col gap-4 pb-10 text-sm leading-relaxed text-ink">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-ink-muted">
            Última actualización: {LEGAL_UPDATED_ON}
          </p>
        </header>
        {children}
      </article>
    </PageShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="mt-2 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-1 pl-5">{children}</ul>;
}

/** "Términos y condiciones · Política de datos" links, under the contact channels. */
export function LegalLinks() {
  const link = 'font-semibold text-brand-600';
  return (
    <p className="mt-8 text-center text-sm text-ink-muted">
      <Link href="/terminos" className={link}>
        Términos y condiciones
      </Link>
      {' · '}
      <Link href="/privacidad" className={link}>
        Política de datos
      </Link>
    </p>
  );
}
