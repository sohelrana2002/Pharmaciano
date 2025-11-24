import { Router } from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticate, authorize(["user:read"]), getProfile);

export default router;