import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  warehousSchemaValidator,
  updateWarehouseValidator,
} from "../validators/warehouse.validator";
import {
  createWarehouse,
  warehouseList,
  warehouseInfo,
  updateWarehouse,
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

// update warehouse
router.put(
  "/:id",
  authenticate,
  authorize(["warehouse:manage"]),
  validate(updateWarehouseValidator),
  updateWarehouse,
);

// delete warehouse
router.delete(
  "/:id",
  authenticate,
  authorize(["warehouse:manage"]),
  deleteWarehouse,
);

export default router;
