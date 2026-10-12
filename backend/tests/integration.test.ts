import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Campaign } from '../src/models/Campaign';
import { Submission } from '../src/models/Submission';

describe('End-to-End API Integration & Concurrency Tests', () => {
  let mongoServer: MongoMemoryServer | null = null;
  let brandToken: string;
  let creatorToken: string;
  let campaignId: string;
  let submissionId: string;

  beforeAll(async () => {
    // Try connecting to local running MongoDB first for instant execution
    const localUri = 'mongodb://127.0.0.1:27017/memed_integration_test';
    try {
      await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
    } catch {
      // Fallback to memory server if local MongoDB is unavailable
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }

    // Clean test db collections
    await User.deleteMany({ email: /_test@/ });
    await Campaign.deleteMany({ name: /Zomato Biryani/ });
    await Submission.deleteMany({ postLink: /zomato_/ });

    // Create Brand
    const brandRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Zomato Marketing',
        email: `zomato_${Date.now()}_test@brand.in`,
        password: 'password123',
        role: 'brand'
      });
    brandToken = brandRes.body.token;

    // Create Creator
    const creatorRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Meme Creator Pro',
        email: `creator_${Date.now()}_test@memes.in`,
        password: 'password123',
        role: 'creator'
      });
    creatorToken = creatorRes.body.token;
  });

  afterAll(async () => {
    // Clean test db collections
    await User.deleteMany({ email: /_test@/ });
    await Campaign.deleteMany({ name: /Zomato Biryani/ });
    await Submission.deleteMany({ postLink: /zomato_/ });

    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('GET /api/health should return 200 with service information', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('POST /api/campaigns - Brand should successfully create campaign with milestone ladder', async () => {
    const res = await request(app)
      .post('/api/campaigns')
      .set('Authorization', `Bearer ${brandToken}`)
      .send({
        name: 'Zomato Biryani Fest Viral Campaign',
        platform: 'Instagram',
        totalBudget: 10000,
        milestones: [
          { viewThreshold: 10000, payout: 500 },
          { viewThreshold: 50000, payout: 2000 },
          { viewThreshold: 100000, payout: 5000 }
        ]
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.campaign.name).toBe('Zomato Biryani Fest Viral Campaign');
    expect(res.body.campaign.remainingBudget).toBe(10000);
    campaignId = res.body.campaign._id;
  });

  it('POST /api/submissions - Creator submits post link to campaign', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        campaignId,
        postLink: `https://instagram.com/reel/zomato_biryani_${Date.now()}`
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.submission.currentViews).toBe(0);
    expect(res.body.submission.currentPayout).toBe(0);
    submissionId = res.body.submission._id;
  });

  it('PATCH /api/submissions/:id/views - Updates view count, awards first milestone payout (no auth needed per spec)', async () => {
    // Crosses 10,000 views threshold -> awards ₹500
    const res = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 12000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submission.currentViews).toBe(12000);
    expect(res.body.submission.currentPayout).toBe(500);
    expect(res.body.campaign.spentBudget).toBe(500);
    expect(res.body.campaign.remainingBudget).toBe(9500);
    expect(res.body.payoutBreakdown.actualPaidIncrement).toBe(500);
  });

  it('PATCH /api/submissions/:id/views - Repeated views should never double-pay', async () => {
    const res = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 12500 });

    expect(res.status).toBe(200);
    expect(res.body.submission.currentPayout).toBe(500);
    expect(res.body.campaign.spentBudget).toBe(500);
    expect(res.body.payoutBreakdown.actualPaidIncrement).toBe(0);
  });

  it('PATCH /api/submissions/:id/views - Jumping to 100k views awards milestone differential', async () => {
    // 100,000 views qualifies for ₹5,000 total.
    // Already received ₹500. Incremental payout = ₹4,500.
    const res = await request(app)
      .patch(`/api/submissions/${submissionId}/views`)
      .send({ views: 105000 });

    expect(res.status).toBe(200);
    expect(res.body.submission.currentPayout).toBe(5000);
    expect(res.body.campaign.spentBudget).toBe(5000);
    expect(res.body.campaign.remainingBudget).toBe(5000);
    expect(res.body.payoutBreakdown.actualPaidIncrement).toBe(4500);
  });

  it('Budget Cap Enforcement: When second creator qualifies for ₹5,000 but only ₹5,000 remains, it pays exactly ₹5,000 and status is exhausted', async () => {
    // Create second submission
    const sub2Res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        campaignId,
        postLink: `https://instagram.com/reel/zomato_second_${Date.now()}`
      });
    const sub2Id = sub2Res.body.submission._id;

    // View update to 110,000 views (target payout ₹5,000). Remaining budget is exactly ₹5,000.
    const viewRes = await request(app)
      .patch(`/api/submissions/${sub2Id}/views`)
      .send({ views: 110000 });

    expect(viewRes.status).toBe(200);
    expect(viewRes.body.submission.currentPayout).toBe(5000);
    expect(viewRes.body.campaign.spentBudget).toBe(10000);
    expect(viewRes.body.campaign.remainingBudget).toBe(0);
    expect(viewRes.body.campaign.status).toBe('exhausted');

    // Third creator tries to earn from exhausted campaign
    const sub3Res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        campaignId,
        postLink: `https://instagram.com/reel/zomato_third_${Date.now()}`
      });
    const sub3Id = sub3Res.body.submission._id;

    const exhaustedRes = await request(app)
      .patch(`/api/submissions/${sub3Id}/views`)
      .send({ views: 50000 });

    expect(exhaustedRes.status).toBe(200);
    expect(exhaustedRes.body.submission.currentPayout).toBe(0); // ₹0 paid because remaining budget is 0
    expect(exhaustedRes.body.payoutBreakdown.actualPaidIncrement).toBe(0);
    expect(exhaustedRes.body.payoutBreakdown.isBudgetCapped).toBe(true);
  });
});
