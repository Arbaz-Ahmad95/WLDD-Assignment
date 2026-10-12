import mongoose from 'mongoose';
import { Campaign, ICampaignDocument } from '../models/Campaign';
import { Submission, ISubmissionDocument } from '../models/Submission';
import { IMilestone, PayoutCalculationResult } from '../types';
import { detectViewSpike } from './anomalyService';

/**
 * Pure function: Calculates the highest milestone payout achieved based on view count.
 * A creator's payout is the amount of the highest milestone their post has crossed.
 */
export function calculateMilestonePayout(
  views: number,
  milestones: IMilestone[]
): { highestMilestone: IMilestone | null; highestMilestoneIndex: number; payout: number } {
  if (!milestones || milestones.length === 0 || views < 0) {
    return { highestMilestone: null, highestMilestoneIndex: -1, payout: 0 };
  }

  // Sort ascending by viewThreshold
  const sorted = [...milestones].sort((a, b) => a.viewThreshold - b.viewThreshold);

  let highestMilestone: IMilestone | null = null;
  let highestMilestoneIndex = -1;

  for (let i = 0; i < sorted.length; i++) {
    if (views >= sorted[i].viewThreshold) {
      highestMilestone = sorted[i];
      highestMilestoneIndex = i;
    } else {
      break;
    }
  }

  const payout = highestMilestone ? highestMilestone.payout : 0;
  return { highestMilestone, highestMilestoneIndex, payout };
}

/**
 * Pure function: Computes incremental payout owed, checks budget cap,
 * and determines the actual payout increment that can be disbursed.
 */
export function determinePayoutIncrement(
  views: number,
  previousPayout: number,
  milestones: IMilestone[],
  remainingBudget: number
): PayoutCalculationResult {
  const { highestMilestone, highestMilestoneIndex, payout: targetPayout } = calculateMilestonePayout(
    views,
    milestones
  );

  // If new target payout is greater than previously disbursed payout for this post,
  // owed increment is the difference.
  // Repeated updates with same views, or view regressions, result in 0 owed increment (no double payout).
  const owedIncrement = Math.max(0, targetPayout - previousPayout);

  let actualPaidIncrement = 0;
  let isBudgetCapped = false;

  if (owedIncrement > 0) {
    if (remainingBudget >= owedIncrement) {
      actualPaidIncrement = owedIncrement;
      isBudgetCapped = false;
    } else {
      // Budget cap reached: Disburse whatever remaining budget is available (down to ₹0)
      actualPaidIncrement = Math.max(0, remainingBudget);
      isBudgetCapped = true;
    }
  }

  const newTotalPayout = previousPayout + actualPaidIncrement;
  const remainingBudgetAfter = Math.max(0, remainingBudget - actualPaidIncrement);

  return {
    previousPayout,
    targetPayout,
    owedIncrement,
    actualPaidIncrement,
    newTotalPayout,
    highestMilestoneCrossed: highestMilestone,
    highestMilestoneIndex,
    isBudgetCapped,
    remainingBudgetBefore: remainingBudget,
    remainingBudgetAfter
  };
}

/**
 * Concurrency-Safe View & Payout Processor
 * Uses Optimistic Concurrency Control with atomic conditional MongoDB operations
 * to ensure two simultaneous view updates can NEVER overspend the campaign budget
 * and repeated updates NEVER double-pay.
 */
export async function processViewUpdateWithConcurrencyControl(
  submissionId: string,
  newViews: number
): Promise<{
  submission: ISubmissionDocument;
  campaign: ICampaignDocument;
  result: PayoutCalculationResult;
}> {
  // Retry loop for handling race conditions gracefully
  const maxRetries = 5;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    // 1. Fetch submission
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission not found with ID ${submissionId}`);
    }

    // 2. Fetch associated campaign
    const campaign = await Campaign.findById(submission.campaignId);
    if (!campaign) {
      throw new Error(`Associated campaign not found for submission ${submissionId}`);
    }

    const previousPayout = submission.currentPayout;
    const previousViews = submission.currentViews;
    const now = new Date();

    // Check for view spike anomaly (bonus requirement)
    const anomalyCheck = detectViewSpike(
      newViews,
      previousViews,
      submission.lastViewUpdatedAt || submission.createdAt
    );

    // Compute payout increment against current campaign remaining budget
    const result = determinePayoutIncrement(
      newViews,
      previousPayout,
      campaign.milestones,
      campaign.remainingBudget
    );

    // If no payout increment is needed (e.g. within same milestone or budget already exhausted)
    if (result.actualPaidIncrement === 0) {
      // Atomically update submission views & history without changing campaign budget
      const updateData: any = {
        currentViews: newViews,
        previousViews: previousViews,
        lastViewUpdatedAt: now,
        highestMilestoneIndex: result.highestMilestoneIndex,
        $push: {
          viewHistory: {
            views: newViews,
            payout: submission.currentPayout,
            timestamp: now
          }
        }
      };

      if (anomalyCheck.isSpike) {
        updateData.isSpikeFlagged = true;
        updateData.spikeReason = anomalyCheck.reason;
      }
      if (result.isBudgetCapped) {
        updateData.isBudgetCapped = true;
      }

      const updatedSubmission = await Submission.findOneAndUpdate(
        { _id: submissionId, currentPayout: previousPayout },
        updateData,
        { new: true }
      );

      if (updatedSubmission) {
        return {
          submission: updatedSubmission,
          campaign,
          result
        };
      }
      // If concurrent modification occurred on submission, retry
      continue;
    }

    // When payout increment > 0:
    // ATOMIC OPERATION 1: Deduct from campaign budget atomically
    // Condition: remainingBudget >= result.actualPaidIncrement
    const updatedCampaign = await Campaign.findOneAndUpdate(
      {
        _id: campaign._id,
        remainingBudget: { $gte: result.actualPaidIncrement }
      },
      {
        $inc: {
          spentBudget: result.actualPaidIncrement,
          remainingBudget: -result.actualPaidIncrement
        },
        $set: {
          status:
            campaign.remainingBudget - result.actualPaidIncrement <= 0
              ? 'exhausted'
              : campaign.status
        }
      },
      { new: true }
    );

    if (!updatedCampaign) {
      // Another concurrent process reduced the campaign budget.
      // Retry so we recalculate against the new remaining budget!
      continue;
    }

    // ATOMIC OPERATION 2: Update submission with the new payout
    // Condition: currentPayout === previousPayout (prevents double payout from duplicate requests)
    const submissionUpdate: any = {
      currentViews: newViews,
      previousViews: previousViews,
      lastViewUpdatedAt: now,
      currentPayout: result.newTotalPayout,
      highestMilestoneIndex: result.highestMilestoneIndex,
      isBudgetCapped: result.isBudgetCapped,
      $push: {
        viewHistory: {
          views: newViews,
          payout: result.newTotalPayout,
          timestamp: now
        }
      }
    };

    if (anomalyCheck.isSpike) {
      submissionUpdate.isSpikeFlagged = true;
      submissionUpdate.spikeReason = anomalyCheck.reason;
    }

    const updatedSubmission = await Submission.findOneAndUpdate(
      { _id: submissionId, currentPayout: previousPayout },
      submissionUpdate,
      { new: true }
    );

    if (!updatedSubmission) {
      // Submission was changed concurrently. Revert campaign deduction and retry!
      await Campaign.findByIdAndUpdate(campaign._id, {
        $inc: {
          spentBudget: -result.actualPaidIncrement,
          remainingBudget: result.actualPaidIncrement
        }
      });
      continue;
    }

    return {
      submission: updatedSubmission,
      campaign: updatedCampaign,
      result
    };
  }

  throw new Error('Could not safely process view update due to high concurrent modifications. Please retry.');
}
