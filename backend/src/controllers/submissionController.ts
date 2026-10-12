import { Request, Response, NextFunction } from 'express';
import { Submission } from '../models/Submission';
import { Campaign } from '../models/Campaign';
import { AuthRequest } from '../types';
import { processViewUpdateWithConcurrencyControl } from '../services/payoutService';
import { cacheService } from '../services/cacheService';

/**
 * Creator: Submit a post link to an active campaign
 */
export async function submitPost(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { campaignId, postLink } = req.body;
    const creatorId = req.user?.userId;

    if (!campaignId || !postLink) {
      res.status(400).json({
        success: false,
        message: 'campaignId and postLink are required'
      });
      return;
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
      return;
    }

    if (campaign.status === 'completed') {
      res.status(400).json({
        success: false,
        message: 'This campaign is already completed and no longer accepts submissions.'
      });
      return;
    }

    // Platform validation
    const trimmedLink = postLink.trim();
    if (campaign.platform === 'Instagram' && !trimmedLink.includes('instagram.com') && !trimmedLink.includes('instagr.am')) {
      res.status(400).json({
        success: false,
        message: 'This campaign requires an Instagram post or reel link'
      });
      return;
    }

    if (campaign.platform === 'YouTube' && !trimmedLink.includes('youtube.com') && !trimmedLink.includes('youtu.be')) {
      res.status(400).json({
        success: false,
        message: 'This campaign requires a YouTube video or short link'
      });
      return;
    }

    // Check duplicate
    const existingSubmission = await Submission.findOne({
      campaignId,
      postLink: trimmedLink
    });

    if (existingSubmission) {
      res.status(409).json({
        success: false,
        message: 'This post link has already been submitted for this campaign'
      });
      return;
    }

    const submission = new Submission({
      campaignId,
      creatorId,
      postLink: trimmedLink,
      currentViews: 0,
      previousViews: 0,
      currentPayout: 0,
      highestMilestoneIndex: -1,
      isSpikeFlagged: false,
      isBudgetCapped: false,
      viewHistory: [
        {
          views: 0,
          payout: 0,
          timestamp: new Date()
        }
      ]
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Post submitted successfully',
      submission
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creator: View their submitted posts and total earnings
 */
export async function getCreatorEarningsAndSubmissions(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const creatorId = req.user?.userId;

    const submissions = await Submission.find({ creatorId })
      .populate('campaignId', 'name platform totalBudget spentBudget remainingBudget milestones status')
      .sort({ createdAt: -1 });

    const totalEarnings = submissions.reduce((sum, s) => sum + s.currentPayout, 0);
    const totalViews = submissions.reduce((sum, s) => sum + s.currentViews, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        totalViews,
        totalSubmissions: submissions.length
      },
      submissions
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Views & Payouts Simulation Endpoint
 * PATCH /api/submissions/:id/views
 * Updates post's view count and calculates creator payout based on highest milestone crossed.
 * Strict budget cap enforced. Concurrency-safe against race conditions and double-spending.
 * No role check needed per requirement (simulates external platform scraper/webhook).
 */
export async function updateSubmissionViews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { views } = req.body;

    if (views === undefined || views === null || isNaN(Number(views))) {
      res.status(400).json({
        success: false,
        message: 'A valid numeric "views" count is required in request body.'
      });
      return;
    }

    const numericViews = Math.max(0, Math.floor(Number(views)));

    // Process view update with concurrency protection
    const { submission, campaign, result } = await processViewUpdateWithConcurrencyControl(
      id,
      numericViews
    );

    // Invalidate campaign cache because remainingBudget has changed
    await cacheService.invalidatePattern('cache:live_campaigns');

    res.status(200).json({
      success: true,
      message: result.owedIncrement > 0
        ? `Views updated to ${numericViews.toLocaleString()}. Unlocked ₹${result.actualPaidIncrement.toLocaleString()} incremental payout!`
        : `Views updated to ${numericViews.toLocaleString()}. No new milestone payout owed.`,
      submission,
      campaign: {
        id: campaign._id,
        name: campaign.name,
        totalBudget: campaign.totalBudget,
        spentBudget: campaign.spentBudget,
        remainingBudget: campaign.remainingBudget,
        status: campaign.status
      },
      payoutBreakdown: {
        previousPayout: result.previousPayout,
        targetPayoutForViews: result.targetPayout,
        owedIncrement: result.owedIncrement,
        actualPaidIncrement: result.actualPaidIncrement,
        newTotalPayout: result.newTotalPayout,
        highestMilestoneCrossed: result.highestMilestoneCrossed,
        isBudgetCapped: result.isBudgetCapped,
        remainingCampaignBudget: result.remainingBudgetAfter
      }
    });
  } catch (err: any) {
    next(err);
  }
}

/**
 * Get single submission details
 */
export async function getSubmissionById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('campaignId')
      .populate('creatorId', 'name email');

    if (!submission) {
      res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (err) {
    next(err);
  }
}
