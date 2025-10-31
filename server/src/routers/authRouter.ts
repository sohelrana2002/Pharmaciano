import { Router } from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;