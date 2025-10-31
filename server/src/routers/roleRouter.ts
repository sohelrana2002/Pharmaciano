import { Router } from 'express';
import { createRole, getRoles, getFeatures } from '../controllers/roleController';
import { authenticate, isSuperAdmin } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { roleSchemaValidator } from '../validators/roleValidator';

const router = Router();

router.use(authenticate);
router.use(isSuperAdmin);

router.post('/', validate(roleSchemaValidator), createRole);
router.get('/', getRoles);
router.get('/features', getFeatures);

export default router;