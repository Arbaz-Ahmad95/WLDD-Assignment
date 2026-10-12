import {
  calculateMilestonePayout,
  determinePayoutIncrement
} from '../src/services/payoutService';
import { IMilestone } from '../src/types';

describe('Payout Calculation & Milestone Ladder Logic', () => {
  // Standard test ladder:
  // 10K views -> ₹500
  // 50K views -> ₹2,000
  // 100K views -> ₹5,000
  // 250K views -> ₹12,000
  const sampleMilestones: IMilestone[] = [
    { viewThreshold: 10000, payout: 500 },
    { viewThreshold: 50000, payout: 2000 },
    { viewThreshold: 100000, payout: 5000 },
    { viewThreshold: 250000, payout: 12000 }
  ];

  describe('calculateMilestonePayout (Pure function)', () => {
    it('should return 0 payout when views are below the lowest milestone threshold', () => {
      const result = calculateMilestonePayout(4500, sampleMilestones);
      expect(result.payout).toBe(0);
      expect(result.highestMilestone).toBeNull();
      expect(result.highestMilestoneIndex).toBe(-1);
    });

    it('should return 0 payout when views are 0 or negative', () => {
      expect(calculateMilestonePayout(0, sampleMilestones).payout).toBe(0);
      expect(calculateMilestonePayout(-100, sampleMilestones).payout).toBe(0);
    });

    it('should return exact milestone payout when views hit exact threshold', () => {
      const result = calculateMilestonePayout(10000, sampleMilestones);
      expect(result.payout).toBe(500);
      expect(result.highestMilestoneIndex).toBe(0);
    });

    it('should maintain the highest achieved milestone when views are between tiers', () => {
      const result = calculateMilestonePayout(35000, sampleMilestones);
      expect(result.payout).toBe(500); // Between 10K and 50K
      expect(result.highestMilestoneIndex).toBe(0);
    });

    it('should step up to the next tier when views cross the next threshold', () => {
      const result = calculateMilestonePayout(50001, sampleMilestones);
      expect(result.payout).toBe(2000); // Crossed 50K
      expect(result.highestMilestoneIndex).toBe(1);
    });

    it('should award the highest tier reached when jumping past multiple tiers in one go', () => {
      // Single jump from 0 to 125,000 views (crosses 10K, 50K, and 100K tiers)
      const result = calculateMilestonePayout(125000, sampleMilestones);
      expect(result.payout).toBe(5000);
      expect(result.highestMilestoneIndex).toBe(2);
    });

    it('should handle unsorted milestones by sorting them internally', () => {
      const unsortedMilestones: IMilestone[] = [
        { viewThreshold: 100000, payout: 5000 },
        { viewThreshold: 10000, payout: 500 },
        { viewThreshold: 50000, payout: 2000 }
      ];
      const result = calculateMilestonePayout(60000, unsortedMilestones);
      expect(result.payout).toBe(2000);
      expect(result.highestMilestoneIndex).toBe(1);
    });
  });

  describe('determinePayoutIncrement & Incremental Payouts', () => {
    it('should calculate initial payout increment for a new post crossing the first milestone', () => {
      const remainingBudget = 50000;
      const previousPayout = 0;
      const views = 15000;

      const result = determinePayoutIncrement(views, previousPayout, sampleMilestones, remainingBudget);

      expect(result.targetPayout).toBe(500);
      expect(result.owedIncrement).toBe(500);
      expect(result.actualPaidIncrement).toBe(500);
      expect(result.newTotalPayout).toBe(500);
      expect(result.isBudgetCapped).toBe(false);
      expect(result.remainingBudgetAfter).toBe(49500);
    });

    it('should calculate only the differential increment when moving from milestone 1 to milestone 2', () => {
      const remainingBudget = 49500;
      const previousPayout = 500; // Already received ₹500 for 10K milestone
      const newViews = 52000; // Now at 50K milestone (worth ₹2,000)

      const result = determinePayoutIncrement(newViews, previousPayout, sampleMilestones, remainingBudget);

      // Total target is ₹2,000, owed increment is ₹2,000 - ₹500 = ₹1,500
      expect(result.targetPayout).toBe(2000);
      expect(result.owedIncrement).toBe(1500);
      expect(result.actualPaidIncrement).toBe(1500);
      expect(result.newTotalPayout).toBe(2000);
      expect(result.remainingBudgetAfter).toBe(48000);
    });

    it('should never double-pay on repeated view updates within the same milestone tier', () => {
      const remainingBudget = 48000;
      const previousPayout = 2000; // Already paid for 50K milestone
      const newViews = 55000; // Still below 100K milestone

      const result = determinePayoutIncrement(newViews, previousPayout, sampleMilestones, remainingBudget);

      expect(result.targetPayout).toBe(2000);
      expect(result.owedIncrement).toBe(0);
      expect(result.actualPaidIncrement).toBe(0);
      expect(result.newTotalPayout).toBe(2000);
      expect(result.remainingBudgetAfter).toBe(48000);
    });

    it('should handle view regression without deducting money or double-paying later', () => {
      const remainingBudget = 48000;
      const previousPayout = 2000;
      const regressedViews = 42000; // Views dropped below 50k due to platform audit

      const result = determinePayoutIncrement(regressedViews, previousPayout, sampleMilestones, remainingBudget);

      expect(result.targetPayout).toBe(500);
      expect(result.owedIncrement).toBe(0);
      expect(result.actualPaidIncrement).toBe(0);
      expect(result.newTotalPayout).toBe(2000); // Creator retains already earned payout
    });
  });
});
