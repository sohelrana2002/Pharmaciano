import { Router } from 'express';
import { createRole, getRoles, getFeatures } from '../controllers/roleController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { roleSchemaValidator } from '../validators/roleValidator';

const router = Router();

// create role 
router.post('/', authenticate, authorize(["role:create"]), validate(roleSchemaValidator), createRole);

// get list of role 
router.get('/', getRoles);

// get all features 
router.get('/features', getFeatures);

export default router;