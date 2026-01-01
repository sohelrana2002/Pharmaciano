import { Router } from 'express';
import { createRole, roleList, getFeatures, updateRole, deleteRole } from '../controllers/roleController';
import { authenticate, authorize } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { roleSchemaValidator, updateRoleValidator } from '../validators/roleValidator';

const router = Router();

// create role 
router.post('/', authenticate, authorize(["role:create"]), validate(roleSchemaValidator), createRole);

// list of role 
router.get('/', authenticate, authorize(["role:list"]), roleList);

// update role 
router.put("/:id", authenticate, authorize(["role:update"]), validate(updateRoleValidator), updateRole);

// delete role 
router.delete("/:id", authenticate, authorize(["role:delete"]), deleteRole)

// get all features 
router.get('/features', getFeatures);

export default router;