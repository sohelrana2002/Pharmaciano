import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { categorySchemaValidator } from "../validators/category.validator";
import { createCategory } from "../controllers/category.controller";

const router = Router();

// create category
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(categorySchemaValidator),
  createCategory,
);

export default router;
