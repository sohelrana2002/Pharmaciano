import { Router } from 'express';
import { createUser, userList, userProfile, updateUser } from '../controllers/userController';
import { authenticate } from '../middlewares/authMiddleware';
import { createUserValidator, updateUserValidator } from '../validators/authValidator';
import { validate } from '../middlewares/validateMiddleware';
import { authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticate, authorize(["user:create"]), validate(createUserValidator), createUser);
router.get('/', authenticate, authorize(["user:user-list"]), userList);
// router.put("/update", authenticate, authorize(["user:update"]), updateUser);
router.get("/profile", authenticate, userProfile);

// update router 
router.put("/:id", authenticate, authorize(["user:update"]), validate(updateUserValidator), updateUser)

export default router;