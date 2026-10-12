import { Router } from 'express';
import { signup, login, getMe, seedDemo } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/seed', seedDemo);

export default router;
