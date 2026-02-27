import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  supplierSchemaValidator,
  updateSupplierValidator,
} from "../validators/supplier.validator";
import {
  createSupplier,
  supplierList,
  supplierInfo,
  updateSupplier,
  deleteSupplier,
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

// update supplier
router.put(
  "/:id",
  authenticate,
  authorize(["supplier:manage"]),
  validate(updateSupplierValidator),
  updateSupplier,
);

// delete supplier
router.delete(
  "/:id",
  authenticate,
  authorize(["supplier:manage"]),
  deleteSupplier,
);

export default router;
