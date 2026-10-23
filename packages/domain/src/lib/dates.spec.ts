import { isCouponLive } from './coupons';
import {
  couponDateToTimestamp,
  formatDate,
  timestampToCouponDate,
} from './dates';

describe('formatDate', () => {
  it('formats in Bogotá time with the es-CO long form', () => {
    // 04:00Z on the 22nd is 23:00 on the 21st in Bogotá (UTC-5).
    expect(formatDate('2026-10-22T04:00:00Z')).toBe('21 de octubre de 2026');
    expect(formatDate(new Date('2026-10-22T12:00:00Z'))).toBe(
      '22 de octubre de 2026',
    );
  });

  it('returns an empty string for missing or invalid values', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('nope')).toBe('');
  });
});

describe('couponDateToTimestamp', () => {
  it('anchors a picked day to Bogotá time', () => {
    expect(couponDateToTimestamp('2026-10-25', 'start')).toBe(
      '2026-10-25T00:00:00.000-05:00',
    );
    expect(couponDateToTimestamp('2026-10-25', 'end')).toBe(
      '2026-10-25T23:59:59.999-05:00',
    );
  });

  it('passes full timestamps through and maps empty to null', () => {
    expect(couponDateToTimestamp('2026-10-25T10:00:00Z', 'end')).toBe(
      '2026-10-25T10:00:00Z',
    );
    expect(couponDateToTimestamp('', 'start')).toBeNull();
    expect(couponDateToTimestamp(undefined, 'end')).toBeNull();
  });

  it('keeps a coupon live until the end of its last day in Bogotá', () => {
    const coupon = {
      is_active: true,
      valid_from: couponDateToTimestamp('2026-10-20', 'start'),
      valid_until: couponDateToTimestamp('2026-10-22', 'end'),
    };
    const liveAt = (iso: string) => isCouponLive(coupon, new Date(iso));
    // 19:30 and 23:30 on the 22nd in Bogotá: still live.
    expect(liveAt('2026-10-23T00:30:00Z')).toBe(true);
    expect(liveAt('2026-10-23T04:30:00Z')).toBe(true);
    // 00:30 on the 23rd in Bogotá: over.
    expect(liveAt('2026-10-23T05:30:00Z')).toBe(false);
    // 23:30 on the 19th in Bogotá: not started yet.
    expect(liveAt('2026-10-20T04:30:00Z')).toBe(false);
  });
});

describe('timestampToCouponDate', () => {
  it('returns the Bogotá calendar day', () => {
    expect(timestampToCouponDate('2026-10-25T23:59:59.999-05:00')).toBe(
      '2026-10-25',
    );
    expect(timestampToCouponDate('2026-10-26T04:59:59.999Z')).toBe(
      '2026-10-25',
    );
    expect(timestampToCouponDate('2026-10-25')).toBe('2026-10-25');
  });

  it('returns an empty string for missing or invalid values', () => {
    expect(timestampToCouponDate(null)).toBe('');
    expect(timestampToCouponDate('nope')).toBe('');
  });
});
