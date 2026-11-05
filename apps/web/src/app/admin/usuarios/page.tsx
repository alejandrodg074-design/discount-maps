import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BILLING_GROUPS,
  billingView,
  formatCop,
  type BillingGroup,
  type BillingView,
} from '@org/domain';
import { createAdminSupabase } from '@org/supabase/server';
import { BackIcon, EmptyState, PageShell, TopBar } from '@org/ui';
import { subscriptionPricePesosOrNull } from '../../../lib/billing';
import { getSession } from '../../../lib/session';

export const dynamic = 'force-dynamic';

const when = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

const GROUP_TONE: Record<BillingGroup, string> = {
  debe_pagar: 'bg-danger/10 text-danger',
  prueba: 'bg-brand-50 text-brand-700',
  pagando: 'bg-success/10 text-success',
  inactivo: 'bg-surface-muted text-ink-muted',
};

interface Row {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  confirmed: boolean;
  hasCard: boolean;
  card: string | null;
  registeredAt: string;
  view: BillingView;
}

/**
 * Admin: every consumer grouped by what they owe (should pay now, free week,
 * paying, inactive). Read with the service role after the admin check, since
 * emails live in auth.users and RLS hides other people's subscriptions.
 */
export default async function AdminUsersPage() {
  const { role } = await getSession();
  if (role !== 'admin') notFound();

  const admin = createAdminSupabase();
  const [{ data: profiles }, { data: subs }, { data: authData }] =
    await Promise.all([
      admin
        .from('profiles')
        .select('id, full_name, phone, created_at')
        .eq('role', 'consumer'),
      admin.from('subscriptions').select('*'),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

  const subByUser = new Map((subs ?? []).map((s) => [s.consumer_id, s]));
  const userById = new Map((authData?.users ?? []).map((u) => [u.id, u]));
  const now = new Date();

  const rows: Row[] = (profiles ?? []).map((p) => {
    const s = subByUser.get(p.id) ?? null;
    const u = userById.get(p.id);
    return {
      id: p.id,
      name: p.full_name || 'Sin nombre',
      email: u?.email ?? null,
      phone: p.phone,
      confirmed: Boolean(u?.email_confirmed_at),
      hasCard: s?.wompi_payment_source_id != null,
      card:
        s && s.wompi_payment_source_id != null
          ? `${s.card_brand ?? 'Tarjeta'} •••• ${s.card_last4 ?? ''}`
          : null,
      registeredAt: p.created_at,
      view: billingView(s, now),
    };
  });

  const byGroup = (g: BillingGroup) =>
    rows
      .filter((r) => r.view.group === g)
      .sort((a, b) =>
        g === 'inactivo'
          ? b.registeredAt.localeCompare(a.registeredAt)
          : (a.view.date?.getTime() ?? 0) - (b.view.date?.getTime() ?? 0),
      );

  const price = subscriptionPricePesosOrNull();
  const paying = byGroup('pagando').length;

  return (
    <PageShell>
      <TopBar
        title="Usuarios y pagos"
        left={
          <Link href="/admin" aria-label="Volver" className="text-ink">
            <BackIcon />
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3">
        {BILLING_GROUPS.map((g) => (
          <a
            key={g.id}
            href={`#${g.id}`}
            className={`rounded-card p-3 ${GROUP_TONE[g.id]}`}
          >
            <p className="text-2xl font-bold">{byGroup(g.id).length}</p>
            <p className="text-xs font-medium">{g.title}</p>
          </a>
        ))}
      </div>
      {price ? (
        <p className="mb-6 text-sm text-ink-muted">
          Ingreso mensual estimado: <strong>{formatCop(paying * price)}</strong>{' '}
          ({paying} × {formatCop(price)}).
        </p>
      ) : null}

      {BILLING_GROUPS.map((g) => {
        const list = byGroup(g.id);
        return (
          <section key={g.id} id={g.id} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-ink">
              {g.title} ({list.length})
            </h2>
            {list.length === 0 ? (
              <EmptyState title="Nadie por ahora" />
            ) : (
              <ul className="flex flex-col gap-3">
                {list.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-card border border-line p-4 text-sm"
                  >
                    <p className="font-semibold text-ink">{r.name}</p>
                    {r.email ? (
                      <a
                        href={`mailto:${r.email}`}
                        className="break-all text-brand-600"
                      >
                        {r.email}
                      </a>
                    ) : null}
                    {r.phone ? (
                      <p className="text-ink-muted">Tel. {r.phone}</p>
                    ) : null}
                    <p className="mt-2 text-ink">
                      {r.view.label}
                      {r.view.date ? (
                        <>
                          : <strong>{when.format(r.view.date)}</strong>
                        </>
                      ) : null}
                    </p>
                    <p className="text-ink-muted">
                      {r.card ?? 'Sin tarjeta'}
                      {r.confirmed ? '' : ' · Correo sin confirmar'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </PageShell>
  );
}
