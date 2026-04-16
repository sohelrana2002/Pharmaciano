import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createPurchaseSchemaValidator } from "../validators/purchase.validator";
import {
  approvePurchase,
  createPurchase,
} from "../controllers/purchase.controller";

const router = Router();

// create purchase
router.post(
  "/",
  authenticate,
  authorize(["purchase:manage, superAdmin:manage"]),
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

export default router;
