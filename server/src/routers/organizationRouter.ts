import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import { createOrganizationValidator } from "../validators/organizationValidator";
import {
  createOrganization,
  organizationInfo,
  organizationList,
  deleteOrganization,
} from "../controllers/organizationController";

const router = Router();

// create organization
router.post(
  "/",
  authenticate,
  authorize(["organization:manage"]),
  validate(createOrganizationValidator),
  createOrganization
);

// list of organization
router.get(
  "/",
  authenticate,
  authorize(["organization:manage"]),
  organizationList
);

// individual organization details
router.get(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  organizationInfo
);

// delete organization
router.delete(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  deleteOrganization
);

export default router;
