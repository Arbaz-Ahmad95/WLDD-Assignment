import { determinePayoutIncrement } from '../src/services/payoutService';
import { IMilestone } from '../src/types';

describe('Campaign Budget Cap & Overspend Prevention Logic', () => {
  const milestones: IMilestone[] = [
    { viewThreshold: 10000, payout: 500 },
    { viewThreshold: 50000, payout: 2000 },
    { viewThreshold: 100000, payout: 5000 },
    { viewThreshold: 250000, payout: 12000 }
  ];

  it('should pay full milestone amount when budget is sufficient', () => {
    const remainingBudget = 10000;
    const previousPayout = 0;
    const views = 100000; // Qualifies for ₹5,000

    const result = determinePayoutIncrement(views, previousPayout, milestones, remainingBudget);

    expect(result.owedIncrement).toBe(5000);
    expect(result.actualPaidIncrement).toBe(5000);
    expect(result.isBudgetCapped).toBe(false);
    expect(result.remainingBudgetAfter).toBe(5000);
    expect(result.newTotalPayout).toBe(5000);
  });

  it('should strictly cap the payout when remaining budget is less than owed increment', () => {
    // Post qualifies for ₹5,000, but only ₹3,200 remains in campaign budget
    const remainingBudget = 3200;
    const previousPayout = 0;
    const views = 100000;

    const result = determinePayoutIncrement(views, previousPayout, milestones, remainingBudget);

    expect(result.targetPayout).toBe(5000);
    expect(result.owedIncrement).toBe(5000);
    expect(result.actualPaidIncrement).toBe(3200); // Strictly capped to ₹3,200!
    expect(result.isBudgetCapped).toBe(true);
    expect(result.remainingBudgetAfter).toBe(0); // Zero remaining, NEVER negative
    expect(result.newTotalPayout).toBe(3200);
  });

  it('should disburse exactly 0 when remaining budget is completely exhausted (₹0)', () => {
    const remainingBudget = 0;
    const previousPayout = 500;
    const views = 50000; // Qualifies for ₹2,000 (owed ₹1,500)

    const result = determinePayoutIncrement(views, previousPayout, milestones, remainingBudget);

    expect(result.owedIncrement).toBe(1500);
    expect(result.actualPaidIncrement).toBe(0); // Cannot pay anything from empty budget
    expect(result.isBudgetCapped).toBe(true);
    expect(result.remainingBudgetAfter).toBe(0);
    expect(result.newTotalPayout).toBe(500); // Retains existing payout
  });

  it('should cap partial increment when post jumps between milestones near budget depletion', () => {
    // Creator already received ₹2,000 for 50k views.
    // Creator now reaches 100k views (target ₹5,000, differential owed = ₹3,000).
    // Campaign remaining budget is only ₹1,400.
    const remainingBudget = 1400;
    const previousPayout = 2000;
    const views = 105000;

    const result = determinePayoutIncrement(views, previousPayout, milestones, remainingBudget);

    expect(result.targetPayout).toBe(5000);
    expect(result.owedIncrement).toBe(3000);
    expect(result.actualPaidIncrement).toBe(1400); // Capped to ₹1,400
    expect(result.isBudgetCapped).toBe(true);
    expect(result.newTotalPayout).toBe(3400); // ₹2,000 + ₹1,400 = ₹3,400
    expect(result.remainingBudgetAfter).toBe(0);
  });

  it('should ensure remainingBudgetAfter can NEVER be less than 0 under any circumstance', () => {
    const remainingBudget = 1; // Only ₹1 left
    const previousPayout = 0;
    const views = 250000; // Qualifies for ₹12,000

    const result = determinePayoutIncrement(views, previousPayout, milestones, remainingBudget);

    expect(result.actualPaidIncrement).toBe(1);
    expect(result.remainingBudgetAfter).toBe(0);
    expect(result.remainingBudgetAfter).toBeGreaterThanOrEqual(0);
  });
});
