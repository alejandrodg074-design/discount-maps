import {
  addDays,
  isEntitled,
  RENEWAL_WINDOW_HOURS,
  subscriptionAccessUntil,
  type SubscriptionLike,
} from './subscription';

const NOW = new Date('2026-09-20T12:00:00Z');
const YESTERDAY = addDays(NOW, -1);
const TOMORROW = addDays(NOW, 1);
const plusWindow = (d: Date) =>
  new Date(d.getTime() + RENEWAL_WINDOW_HOURS * 3_600_000);

function sub(partial: Partial<SubscriptionLike>): SubscriptionLike {
  return {
    status: 'trialing',
    trial_ends_at: TOMORROW,
    current_period_end: null,
    ...partial,
  };
}

describe('subscriptionAccessUntil', () => {
  it('a free week without a card ends exactly at trial_ends_at', () => {
    expect(subscriptionAccessUntil(sub({ status: 'trialing' }))).toEqual(
      TOMORROW,
    );
  });

  it('a trial with a card keeps the renewal window for the first charge', () => {
    expect(
      subscriptionAccessUntil(
        sub({ status: 'trialing', wompi_payment_source_id: 7 }),
      ),
    ).toEqual(plusWindow(TOMORROW));
  });

  it('active ends at current_period_end plus the renewal window', () => {
    expect(
      subscriptionAccessUntil(
        sub({ status: 'active', current_period_end: TOMORROW }),
      ),
    ).toEqual(plusWindow(TOMORROW));
  });

  it('past_due has no grace: access ends at the period end', () => {
    expect(
      subscriptionAccessUntil(
        sub({ status: 'past_due', current_period_end: YESTERDAY }),
      ),
    ).toEqual(YESTERDAY);
  });

  it('past_due falls back to trial end when there was never a paid period', () => {
    expect(
      subscriptionAccessUntil(
        sub({ status: 'past_due', trial_ends_at: YESTERDAY }),
      ),
    ).toEqual(YESTERDAY);
  });

  it('canceled keeps access until the paid period ends', () => {
    expect(
      subscriptionAccessUntil(
        sub({ status: 'canceled', current_period_end: TOMORROW }),
      ),
    ).toEqual(TOMORROW);
  });

  it('accepts ISO strings', () => {
    expect(
      subscriptionAccessUntil(sub({ trial_ends_at: TOMORROW.toISOString() })),
    ).toEqual(TOMORROW);
  });
});

describe('isEntitled', () => {
  it.each<[string, SubscriptionLike, boolean]>([
    ['trial still running', sub({ trial_ends_at: TOMORROW }), true],
    ['trial ended', sub({ trial_ends_at: YESTERDAY }), false],
    [
      'active, period open',
      sub({ status: 'active', current_period_end: TOMORROW }),
      true,
    ],
    [
      'active, period ended',
      sub({ status: 'active', current_period_end: YESTERDAY }),
      false,
    ],
    [
      'past_due right after a failed charge',
      sub({ status: 'past_due', current_period_end: YESTERDAY }),
      false,
    ],
    [
      'active, renewal due an hour ago (not charged yet)',
      sub({
        status: 'active',
        current_period_end: new Date(NOW.getTime() - 3_600_000),
      }),
      true,
    ],
    [
      'canceled before period end',
      sub({ status: 'canceled', current_period_end: TOMORROW }),
      true,
    ],
    [
      'canceled after period end',
      sub({ status: 'canceled', current_period_end: YESTERDAY }),
      false,
    ],
    ['active with no period end', sub({ status: 'active' }), false],
  ])('%s', (_label, s, expected) => {
    expect(isEntitled(s, NOW)).toBe(expected);
  });

  it('no subscription means no entitlement', () => {
    expect(isEntitled(null, NOW)).toBe(false);
    expect(isEntitled(undefined, NOW)).toBe(false);
  });

  it('access ending exactly now is not entitled', () => {
    expect(isEntitled(sub({ trial_ends_at: NOW }), NOW)).toBe(false);
  });
});
