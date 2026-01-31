import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { categorySchemaValidator } from "../validators/category.validator";
import {
  createCategory,
  categoryList,
} from "../controllers/category.controller";

const router = Router();

// create category
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(categorySchemaValidator),
  createCategory,
);

// list of category
router.get("/", authenticate, authorize(["inventory:manage"]), categoryList);

export default router;
