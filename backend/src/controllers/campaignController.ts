import { Request, Response, NextFunction } from 'express';
import { Campaign } from '../models/Campaign';
import { Submission } from '../models/Submission';
import { AuthRequest, IMilestone } from '../types';
import { cacheService } from '../services/cacheService';

const CAMPAIGNS_CACHE_KEY = 'cache:live_campaigns';

/**
 * Brand: Create a new campaign
 */
export async function createCampaign(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, platform, totalBudget, milestones } = req.body;
    const brandId = req.user?.userId;

    if (!name || !platform || !totalBudget || !milestones) {
      res.status(400).json({
        success: false,
        message: 'Name, platform, totalBudget, and milestones are required'
      });
      return;
    }

    if (!['Instagram', 'YouTube'].includes(platform)) {
      res.status(400).json({
        success: false,
        message: 'Platform must be either Instagram or YouTube'
      });
      return;
    }

    const budgetNum = Number(totalBudget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      res.status(400).json({
        success: false,
        message: 'Total budget must be a positive number'
      });
      return;
    }

    if (!Array.isArray(milestones) || milestones.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Milestones must be a non-empty array of { viewThreshold, payout }'
      });
      return;
    }

    // Validate and sanitize milestones
    const sanitizedMilestones: IMilestone[] = [];
    for (const m of milestones) {
      const viewThreshold = Number(m.viewThreshold);
      const payout = Number(m.payout);
      if (isNaN(viewThreshold) || viewThreshold <= 0 || isNaN(payout) || payout < 0) {
        res.status(400).json({
          success: false,
          message: 'Each milestone must have valid viewThreshold (>0) and payout (>=0)'
        });
        return;
      }
      sanitizedMilestones.push({ viewThreshold, payout });
    }

    // Sort ascending by viewThreshold
    sanitizedMilestones.sort((a, b) => a.viewThreshold - b.viewThreshold);

    const campaign = new Campaign({
      name: name.trim(),
      platform,
      totalBudget: budgetNum,
      spentBudget: 0,
      remainingBudget: budgetNum,
      milestones: sanitizedMilestones,
      brandId,
      status: 'active'
    });

    await campaign.save();

    // Invalidate Redis/memory cache
    await cacheService.del(CAMPAIGNS_CACHE_KEY);

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      campaign
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creator/Public: List live campaigns (with Redis caching)
 */
export async function listLiveCampaigns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const platform = req.query.platform as string;
    const cacheKey = platform ? `${CAMPAIGNS_CACHE_KEY}:${platform}` : CAMPAIGNS_CACHE_KEY;

    // Check Redis / Memory cache
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      res.status(200).json({
        success: true,
        source: 'cache',
        campaigns: cachedData
      });
      return;
    }

    const filter: any = { status: { $in: ['active', 'exhausted'] } };
    if (platform && ['Instagram', 'YouTube'].includes(platform)) {
      filter.platform = platform;
    }

    const campaigns = await Campaign.find(filter)
      .populate('brandId', 'name email')
      .sort({ createdAt: -1 });

    // Store in cache for 60 seconds
    await cacheService.set(cacheKey, campaigns, 60);

    res.status(200).json({
      success: true,
      source: 'database',
      campaigns
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Brand: Get all campaigns created by this brand, along with aggregate metrics
 */
export async function getBrandCampaigns(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const brandId = req.user?.userId;

    const campaigns = await Campaign.find({ brandId }).sort({ createdAt: -1 });

    // Aggregate stats across all campaigns for this brand
    let totalCommittedBudget = 0;
    let totalSpentBudget = 0;
    let totalRemainingBudget = 0;

    campaigns.forEach((c) => {
      totalCommittedBudget += c.totalBudget;
      totalSpentBudget += c.spentBudget;
      totalRemainingBudget += c.remainingBudget;
    });

    // Also get submission count and total views driven for this brand
    const campaignIds = campaigns.map((c) => c._id);
    const submissions = await Submission.find({ campaignId: { $in: campaignIds } });

    const totalSubmissions = submissions.length;
    const totalViewsDriven = submissions.reduce((sum, s) => sum + s.currentViews, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalCampaigns: campaigns.length,
        totalCommittedBudget,
        totalSpentBudget,
        totalRemainingBudget,
        totalSubmissions,
        totalViewsDriven
      },
      campaigns
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed single campaign with all submissions and analytics
 */
export async function getCampaignById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id).populate('brandId', 'name email');
    if (!campaign) {
      res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
      return;
    }

    const submissions = await Submission.find({ campaignId: id })
      .populate('creatorId', 'name email')
      .sort({ currentPayout: -1, currentViews: -1 });

    res.status(200).json({
      success: true,
      campaign,
      submissions
    });
  } catch (err) {
    next(err);
  }
}
