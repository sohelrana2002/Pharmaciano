import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { inventoryBatchSchemaValidator } from "../validators/inventoryBatch.validator";
import { createInventoryBatch } from "../controllers/inventoryBatch.controller";

const router = Router();

// create inventoryBatch
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(inventoryBatchSchemaValidator),
  createInventoryBatch,
);

export default router;
