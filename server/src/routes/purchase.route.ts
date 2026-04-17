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
  deletePurchase,
  purchaseInfo,
  purchaseList,
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
  authorize(["purchase:manage", "superAdmin:manage"]),
  approvePurchase,
);

// receive Purchase inventory batch update here
router.patch(
  "/:id/receive",
  authenticate,
  authorize(["purchase:manage", "superAdmin:manage"]),
  validate(updatePurchaseSchemaValidator),
  receivePurchase,
);

// list of purchase
router.get(
  "/",
  authenticate,
  authorize(["purchase:manage", "superAdmin:manage"]),
  purchaseList,
);

// individual purchase info
router.get(
  "/:id",
  authenticate,
  authorize(["purchase:manage", "superAdmin:manage"]),
  purchaseInfo,
);

// delete purchase
router.delete(
  "/:id",
  authenticate,
  authorize(["purchase:manage", "superAdmin:manage"]),
  deletePurchase,
);

export default router;
