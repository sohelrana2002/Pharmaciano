import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { medicineSchemaValidator } from "../validators/medicine.validator";
import { createMedicine } from "../controllers/medicine.controller";

const router = Router();

// create medicine
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(medicineSchemaValidator),
  createMedicine,
);

export default router;
