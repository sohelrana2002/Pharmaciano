import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { warehousSchemaValidator } from "../validators/warehouse.validator";
import {
  createWarehouse,
  warehouseList,
  warehouseInfo,
  deleteWarehouse,
} from "../controllers/warehouse.controller";

const router = Router();

// create warehouse
router.post(
  "/",
  authenticate,
  authorize(["warehouse:manage"]),
  validate(warehousSchemaValidator),
  createWarehouse,
);

// list of warehouse
router.get("/", authenticate, authorize(["warehouse:manage"]), warehouseList);

// individual warehouse info
router.get(
  "/:id",
  authenticate,
  authorize(["warehouse:manage"]),
  warehouseInfo,
);

// delete warehouse
router.delete(
  "/:id",
  authenticate,
  authorize(["warehouse:manage"]),
  deleteWarehouse,
);

export default router;
