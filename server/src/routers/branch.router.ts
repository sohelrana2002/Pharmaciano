import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { branchSchemaValidator } from "../validators/branch.validator";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { createBranch, branchList } from "../controllers/branch.controller";

const router = Router();

// create branch
router.post(
  "/",
  authenticate,
  authorize(["organization:manage"]),
  validate(branchSchemaValidator),
  createBranch,
);

// list of branch
router.get("/", authenticate, authorize(["organization:manage"]), branchList);

export default router;
