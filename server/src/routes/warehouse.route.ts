import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { warehousSchemaValidator } from "../validators/warehouse.validator";
import {
  createWarehouse,
  warehouseList,
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

export default router;
