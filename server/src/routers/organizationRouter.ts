import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createOrganizationValidator } from "../validators/organizationValidator";
import { createOrganization } from "../controllers/organizationController";


const router = Router();

// create organization 
router.post("/", authenticate, authorize(["organization:manage"]), validate(createOrganizationValidator), createOrganization);

export default router;