import { Router } from 'express';
import { createUser, userList, userProfile } from '../controllers/userController';
import { authenticate, isSuperAdmin } from '../middlewares/authMiddleware';
import { createUserValidator } from '../validators/authValidator';
import { validate } from '../middlewares/validateMiddleware';
import { authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, isSuperAdmin, validate(createUserValidator), createUser);
router.get('/', authenticate, authorize(["user:read"]), userList);
// router.put("/update", authenticate, authorize(["user:update"]), updateUser);
// router.put("/update", authenticate, updateUser);
router.get("/profile", authenticate, userProfile);

export default router;