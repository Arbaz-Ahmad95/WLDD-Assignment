import { User } from '../models/User';
import { Campaign } from '../models/Campaign';
import { Submission } from '../models/Submission';

export async function seedInitialData(): Promise<{ brands: number; creators: number; campaigns: number; submissions: number }> {
  // Check if brand demo exists
  let brand = await User.findOne({ email: 'brand@memed.in' });
  if (!brand) {
    brand = new User({
      name: 'Swiggy Growth Marketing',
      email: 'brand@memed.in',
      password: 'password123',
      role: 'brand'
    });
    await brand.save();
    console.log('🌱 Seeded Demo Brand: brand@memed.in');
  }

  let brand2 = await User.findOne({ email: 'nike@memed.in' });
  if (!brand2) {
    brand2 = new User({
      name: 'Nike India Brand Ops',
      email: 'nike@memed.in',
      password: 'password123',
      role: 'brand'
    });
    await brand2.save();
  }

  let creator = await User.findOne({ email: 'creator@memed.in' });
  if (!creator) {
    creator = new User({
      name: 'Rohan (The Desi Memer)',
      email: 'creator@memed.in',
      password: 'password123',
      role: 'creator'
    });
    await creator.save();
    console.log('🌱 Seeded Demo Creator: creator@memed.in');
  }

  let creator2 = await User.findOne({ email: 'memeking@memed.in' });
  if (!creator2) {
    creator2 = new User({
      name: 'Sarcasm Club Hype',
      email: 'memeking@memed.in',
      password: 'password123',
      role: 'creator'
    });
    await creator2.save();
  }

  // WLDD Evaluation Demo Accounts
  let hrBrand = await User.findOne({ email: 'hr@wldd.in' });
  if (!hrBrand) {
    hrBrand = new User({
      name: 'WLDD Evaluation Team (Brand)',
      email: 'hr@wldd.in',
      password: 'password123',
      role: 'brand'
    });
    await hrBrand.save();
    console.log('🌱 Seeded HR Demo Brand: hr@wldd.in');
  }

  let hrCreator = await User.findOne({ email: 'evaluator@wldd.in' });
  if (!hrCreator) {
    hrCreator = new User({
      name: 'WLDD Evaluator (Creator)',
      email: 'evaluator@wldd.in',
      password: 'password123',
      role: 'creator'
    });
    await hrCreator.save();
    console.log('🌱 Seeded HR Demo Creator: evaluator@wldd.in');
  }

  // Seed sample campaigns if none exist
  const existingCampaigns = await Campaign.countDocuments();
  let camp1, camp2, camp3;

  if (existingCampaigns === 0) {
    camp1 = await Campaign.create({
      name: 'Swiggy Midnight Craving Meme Blitz',
      platform: 'Instagram',
      totalBudget: 50000,
      spentBudget: 5500,
      remainingBudget: 44500,
      milestones: [
        { viewThreshold: 10000, payout: 500 },
        { viewThreshold: 50000, payout: 2000 },
        { viewThreshold: 100000, payout: 5000 },
        { viewThreshold: 250000, payout: 12000 }
      ],
      brandId: brand._id,
      status: 'active'
    });

    camp2 = await Campaign.create({
      name: 'Nike Pegasus YouTube Shorts Hype Challenge',
      platform: 'YouTube',
      totalBudget: 80000,
      spentBudget: 10000,
      remainingBudget: 70000,
      milestones: [
        { viewThreshold: 20000, payout: 1000 },
        { viewThreshold: 80000, payout: 4000 },
        { viewThreshold: 200000, payout: 10000 },
        { viewThreshold: 500000, payout: 25000 }
      ],
      brandId: brand2._id,
      status: 'active'
    });

    camp3 = await Campaign.create({
      name: 'Spotify India Beats & Memes Wave',
      platform: 'Instagram',
      totalBudget: 25000,
      spentBudget: 6300,
      remainingBudget: 18700,
      milestones: [
        { viewThreshold: 5000, payout: 300 },
        { viewThreshold: 25000, payout: 1500 },
        { viewThreshold: 75000, payout: 4500 }
      ],
      brandId: brand._id,
      status: 'active'
    });

    console.log('🌱 Seeded 3 Demo Campaigns');

    // Seed submissions
    await Submission.create([
      {
        campaignId: camp1._id,
        creatorId: creator._id,
        postLink: 'https://instagram.com/reel/Cx9_swiggy_bhangra_meme',
        currentViews: 112000,
        previousViews: 100000,
        currentPayout: 5000,
        highestMilestoneIndex: 2,
        isSpikeFlagged: false,
        isBudgetCapped: false,
        viewHistory: [
          { views: 0, payout: 0, timestamp: new Date(Date.now() - 86400000 * 3) },
          { views: 12000, payout: 500, timestamp: new Date(Date.now() - 86400000 * 2) },
          { views: 54000, payout: 2000, timestamp: new Date(Date.now() - 86400000) },
          { views: 112000, payout: 5000, timestamp: new Date() }
        ]
      },
      {
        campaignId: camp1._id,
        creatorId: creator2._id,
        postLink: 'https://instagram.com/reel/Cy1_swiggy_late_night_order',
        currentViews: 14500,
        previousViews: 12000,
        currentPayout: 500,
        highestMilestoneIndex: 0,
        isSpikeFlagged: false,
        isBudgetCapped: false,
        viewHistory: [
          { views: 0, payout: 0, timestamp: new Date(Date.now() - 86400000) },
          { views: 14500, payout: 500, timestamp: new Date() }
        ]
      },
      {
        campaignId: camp2._id,
        creatorId: creator._id,
        postLink: 'https://youtube.com/shorts/nike_pegasus_speed_run_edit',
        currentViews: 204000,
        previousViews: 195000,
        currentPayout: 10000,
        highestMilestoneIndex: 2,
        isSpikeFlagged: false,
        isBudgetCapped: false,
        viewHistory: [
          { views: 0, payout: 0, timestamp: new Date(Date.now() - 86400000 * 2) },
          { views: 24000, payout: 1000, timestamp: new Date(Date.now() - 86400000) },
          { views: 204000, payout: 10000, timestamp: new Date() }
        ]
      }
    ]);

    console.log('🌱 Seeded Demo Submissions');
  }

  const brandsCount = await User.countDocuments({ role: 'brand' });
  const creatorsCount = await User.countDocuments({ role: 'creator' });
  const campaignsCount = await Campaign.countDocuments();
  const submissionsCount = await Submission.countDocuments();

  return {
    brands: brandsCount,
    creators: creatorsCount,
    campaigns: campaignsCount,
    submissions: submissionsCount
  };
}
