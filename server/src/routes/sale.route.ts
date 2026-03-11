import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { saleSchemaValidator } from "../validators/sale.validator";
import { createSale } from "../controllers/sale.controller";

const router = Router();

// create sales
router.post(
  "/",
  authenticate,
  authorize(["cashier:manage"]),
  validate(saleSchemaValidator),
  createSale,
);

export default router;
