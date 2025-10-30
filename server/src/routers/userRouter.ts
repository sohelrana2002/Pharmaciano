import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController';
import { authenticate, isSuperAdmin } from '../middlewares/authMiddleware';
import { createUserValidator } from '../validators/authValidator';
import { validate } from '../middlewares/validateMiddleware';

const router = Router();

router.use(authenticate);
router.use(isSuperAdmin);

router.post('/', validate(createUserValidator), createUser);
router.get('/', getUsers);

export default router;