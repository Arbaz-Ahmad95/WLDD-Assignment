import { Router } from 'express';
import {
  createCampaign,
  listLiveCampaigns,
  getBrandCampaigns,
  getCampaignById
} from '../controllers/campaignController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();

// Public / Creator: list live campaigns (supports Redis caching)
router.get('/', listLiveCampaigns);

// Brand: get campaigns created by brand with budget analytics
router.get('/brand', authenticate, requireRole('brand'), getBrandCampaigns);

// Public / Authenticated: get single campaign details & submissions
router.get('/:id', getCampaignById);

// Brand: create campaign
router.post('/', authenticate, requireRole('brand'), createCampaign);

export default router;
