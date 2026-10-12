import { Router } from 'express';
import {
  submitPost,
  getCreatorEarningsAndSubmissions,
  updateSubmissionViews,
  getSubmissionById
} from '../controllers/submissionController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();

// Creator: submit post link
router.post('/', authenticate, requireRole('creator'), submitPost);

// Creator: view earnings & my submissions
router.get('/creator', authenticate, requireRole('creator'), getCreatorEarningsAndSubmissions);

// Single submission details
router.get('/:id', getSubmissionById);

// Platform Webhook / Simulator: update post view count & calculate payout
// Per specification: simulates platform data; no role check needed on this endpoint
router.patch('/:id/views', updateSubmissionViews);

export default router;
