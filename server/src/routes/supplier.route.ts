import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { supplierSchemaValidator } from "../validators/supplier.validator";
import { createSupplier } from "../controllers/supplier.controller";

const router = Router();

// create suppliers
router.post(
  "/",
  authenticate,
  authorize(["supplier:manage"]),
  validate(supplierSchemaValidator),
  createSupplier,
);

export default router;
