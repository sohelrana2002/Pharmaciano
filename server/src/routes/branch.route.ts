import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import {
  branchSchemaValidator,
  updateBranchVaidator,
} from "../validators/branch.validator";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
  createBranch,
  branchList,
  branchInfo,
  updateBranch,
  deleteBranch,
} from "../controllers/branch.controller";

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

// individual branch info
router.get(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  branchInfo,
);

// update branch
router.put(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  validate(updateBranchVaidator),
  updateBranch,
);

// delete branch
router.delete(
  "/:id",
  authenticate,
  authorize(["organization:manage"]),
  deleteBranch,
);

export default router;
