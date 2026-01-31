import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  categorySchemaValidator,
  updateCategoryValidator,
} from "../validators/category.validator";
import {
  createCategory,
  categoryList,
  categoryInfo,
  updateCategory,
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

// individual category info
router.get("/:id", authenticate, authorize(["inventory:manage"]), categoryInfo);

// update category
router.put(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  validate(updateCategoryValidator),
  updateCategory,
);

export default router;
