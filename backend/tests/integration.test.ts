import request from 'supertest';
import mongoose from 'express';
import app from '../src/app';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongooseConn from 'mongoose';
import { User } from '../src/models/User';
import { Campaign } from '../src/models/Campaign';
import { Submission } from '../src/models/Submission';

describe('End-to-End API Integration & Concurrency Tests', () => {
  let mongoServer: MongoMemoryServer;
  let brandToken: string;
  let creatorToken: string;
  let brandId: string;
  let creatorId: string;
  let campaignId: string;
  let submissionId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongooseConn.connect(uri);

    // Create Brand
    const brandRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Zomato Marketing',
        email: 'zomato_test@brand.in',
        password: 'password123',
        role: 'brand'
      });
    brandToken = brandRes.body.token;
    brandId = brandRes.body.user.id;

    // Create Creator
    const creatorRes = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Meme Creator Pro',
        email: 'creator_test@memes.in',
        password: 'password123',
        role: 'creator'
      });
    creatorToken = creatorRes.body.token;
    creatorId = creatorRes.body.user.id;
  });

  afterAll(async () => {
    await mongooseConn.disconnect();
    await mongoServer.stop();
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
        postLink: 'https://instagram.com/reel/zomato_biryani_funny_clip'
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
        postLink: 'https://instagram.com/reel/zomato_second_viral_creator'
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
        postLink: 'https://instagram.com/reel/zomato_third_creator'
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
