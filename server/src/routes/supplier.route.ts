import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { supplierSchemaValidator } from "../validators/supplier.validator";
import {
  createSupplier,
  supplierList,
  supplierInfo,
} from "../controllers/supplier.controller";

const router = Router();

// create suppliers
router.post(
  "/",
  authenticate,
  authorize(["supplier:manage"]),
  validate(supplierSchemaValidator),
  createSupplier,
);

// list of suppliers
router.get("/", authenticate, authorize(["supplier:manage"]), supplierList);

// individual suppliers info
router.get("/:id", authenticate, authorize(["supplier:manage"]), supplierInfo);

export default router;
