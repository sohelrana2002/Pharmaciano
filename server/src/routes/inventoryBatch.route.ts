import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { inventoryBatchSchemaValidator } from "../validators/inventoryBatch.validator";
import {
  createInventoryBatch,
  inventoryBatchList,
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

export default router;
