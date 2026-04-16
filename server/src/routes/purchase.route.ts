import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createPurchaseSchemaValidator,
  updatePurchaseSchemaValidator,
} from "../validators/purchase.validator";
import {
  approvePurchase,
  createPurchase,
  receivePurchase,
} from "../controllers/purchase.controller";

const router = Router();

// create purchase
router.post(
  "/",
  authenticate,
  authorize(["purchase:manage", "superAdmin:manage"]),
  validate(createPurchaseSchemaValidator),
  createPurchase,
);

// approve purchase
router.patch(
  "/:id/approve",
  authenticate,
  authorize(["superAdmin:manage"]),
  approvePurchase,
);

// receive Purchase inventory batch update here
router.patch(
  "/:id/receive",
  authenticate,
  authorize(["superAdmin:manage"]),
  validate(updatePurchaseSchemaValidator),
  receivePurchase,
);

export default router;
