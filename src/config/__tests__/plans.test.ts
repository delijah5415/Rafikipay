import {
  PLANS,
  PLAN_LIST,
  TAX_RATE,
  TAX_PERCENT,
  getPlanPriceCents,
  computeTax,
  priceBreakdown,
} from '../plans';

describe('plans config', () => {
  it('defines the four launch tiers at the required prices', () => {
    expect(PLANS.free.priceCents).toBe(0);
    expect(PLANS.pro.priceCents).toBe(2000); // $20
    expect(PLANS.premium.priceCents).toBe(3500); // $35
    expect(PLANS.group.priceCents).toBe(6500); // $65
  });

  it('exposes a flat 2% tax rate', () => {
    expect(TAX_RATE).toBe(0.02);
    expect(TAX_PERCENT).toBe(2);
  });

  it('PLAN_LIST contains every plan', () => {
    expect(PLAN_LIST.map((p) => p.id).sort()).toEqual([
      'free',
      'group',
      'premium',
      'pro',
    ]);
  });

  describe('getPlanPriceCents', () => {
    it('returns the plan price', () => {
      expect(getPlanPriceCents('premium')).toBe(3500);
    });
    it('returns 0 for unknown plans', () => {
      expect(getPlanPriceCents('nope')).toBe(0);
    });
  });

  describe('computeTax', () => {
    it('is 2% rounded to the nearest cent', () => {
      expect(computeTax(2000)).toBe(40);
      expect(computeTax(6500)).toBe(130);
      expect(computeTax(1025)).toBe(21); // 20.5 rounds up
    });
  });

  describe('priceBreakdown', () => {
    it('computes subtotal, tax and total for a single unit', () => {
      expect(priceBreakdown('pro')).toEqual({
        subtotal: 2000,
        tax: 40,
        total: 2040,
      });
    });

    it('multiplies by quantity', () => {
      expect(priceBreakdown('group', 3)).toEqual({
        subtotal: 19500,
        tax: 390,
        total: 19890,
      });
    });

    it('is all zeros for the free plan', () => {
      expect(priceBreakdown('free')).toEqual({
        subtotal: 0,
        tax: 0,
        total: 0,
      });
    });
  });
});
