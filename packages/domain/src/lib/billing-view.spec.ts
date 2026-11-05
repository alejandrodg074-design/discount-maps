import { billingView, type BillingViewInput } from './billing-view';
import { addDays } from './subscription';

const NOW = new Date('2026-11-04T20:00:00Z');

function sub(partial: Partial<BillingViewInput>): BillingViewInput {
  return {
    status: 'trialing',
    trial_ends_at: addDays(NOW, 3),
    current_period_end: null,
    next_charge_at: null,
    wompi_payment_source_id: null,
    ...partial,
  };
}

describe('billingView', () => {
  it('no subscription row: never entered the app', () => {
    expect(billingView(null, NOW).group).toBe('inactivo');
  });

  it('free week running: pays soon, with or without a card', () => {
    const cardless = billingView(sub({}), NOW);
    expect(cardless.group).toBe('prueba');
    expect(cardless.date).toEqual(addDays(NOW, 3));
    expect(billingView(sub({ wompi_payment_source_id: 9 }), NOW).label).toBe(
      'Primer cobro automático',
    );
  });

  it('free week over without a card: should pay now', () => {
    expect(
      billingView(sub({ trial_ends_at: addDays(NOW, -1) }), NOW).group,
    ).toBe('debe_pagar');
  });

  it('failed charge: should pay now', () => {
    expect(
      billingView(
        sub({ status: 'past_due', next_charge_at: addDays(NOW, 2) }),
        NOW,
      ),
    ).toEqual({
      group: 'debe_pagar',
      label: 'Cobro fallido · próximo reintento',
      date: addDays(NOW, 2),
    });
  });

  it('active: paying, with the next charge date', () => {
    const v = billingView(
      sub({
        status: 'active',
        current_period_end: addDays(NOW, 20),
        next_charge_at: addDays(NOW, 20),
        wompi_payment_source_id: 9,
      }),
      NOW,
    );
    expect(v.group).toBe('pagando');
    expect(v.date).toEqual(addDays(NOW, 20));
  });

  it('canceled: inactive, with access left or over', () => {
    expect(
      billingView(
        sub({ status: 'canceled', current_period_end: addDays(NOW, 5) }),
        NOW,
      ).label,
    ).toBe('Canceló · acceso hasta');
    expect(
      billingView(
        sub({ status: 'canceled', current_period_end: addDays(NOW, -5) }),
        NOW,
      ).label,
    ).toBe('Suscripción terminada');
  });
});
