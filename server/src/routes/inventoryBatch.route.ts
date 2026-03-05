import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  inventoryBatchSchemaValidator,
  updateInventoryBatchValidator,
} from "../validators/inventoryBatch.validator";
import {
  createInventoryBatch,
  inventoryBatchList,
  inventoryBatchInfo,
  updateInventoryBatch,
} from "../controllers/inventoryBatch.controller";

const router = Router();

// create inventoryBatch
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(inventoryBatchSchemaValidator),
  createInventoryBatch,
);

// list of inventoryBatch
router.get(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  inventoryBatchList,
);

// individual inventoryBatch info
router.get(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  inventoryBatchInfo,
);

// update inventoryBatch
router.put(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  validate(updateInventoryBatchValidator),
  updateInventoryBatch,
);

export default router;
