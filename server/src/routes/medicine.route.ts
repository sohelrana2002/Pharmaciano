import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { medicineSchemaValidator } from "../validators/medicine.validator";
import {
  createMedicine,
  medicineList,
  medicineInfo,
  deleteMedicine,
} from "../controllers/medicine.controller";

const router = Router();

// create medicine
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(medicineSchemaValidator),
  createMedicine,
);

// list of medicine
router.get("/", authenticate, authorize(["inventory:manage"]), medicineList);

// individual medicine info
router.get("/:id", authenticate, authorize(["inventory:manage"]), medicineInfo);

// delete medicine
router.delete(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  deleteMedicine,
);

export default router;
