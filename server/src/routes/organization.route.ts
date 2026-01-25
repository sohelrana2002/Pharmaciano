import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createOrganizationValidator,
  updateOrganizationVaidator,
} from "../validators/organization.validator";
import {
  createOrganization,
  organizationInfo,
  organizationList,
  updateOrganization,
  deleteOrganization,
} from "../controllers/organization.controller";

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

// update organization
router.put(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  validate(updateOrganizationVaidator),
  updateOrganization
);

// delete organization
router.delete(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  deleteOrganization
);

export default router;
