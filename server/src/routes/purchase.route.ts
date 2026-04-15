import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createPurchaseSchemaValidator } from "../validators/purchase.validator";
import { createPurchase } from "../controllers/purchase.controller";

const router = Router();

// create purchase
router.post(
  "/",
  authenticate,
  authorize(["purchase:manage"]),
  validate(createPurchaseSchemaValidator),
  createPurchase,
);

export default router;
