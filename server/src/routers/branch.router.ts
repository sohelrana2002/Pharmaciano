import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { branchSchemaValidator } from "../validators/branch.validator";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createBranch } from "../controllers/branch.controller";

const router = Router();

// create branch
router.post(
  "/",
  authenticate,
  authorize(["organization:manage"]),
  validate(branchSchemaValidator),
  createBranch
);

export default router;
