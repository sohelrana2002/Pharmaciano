import { Router } from "express";
import {
  createBrand,
  brandList,
  brandInfo,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  brandSchemaValidator,
  updateBrandValidator,
} from "../validators/brand.validator";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

// create brand
router.post(
  "/",
  authenticate,
  authorize(["inventory:manage"]),
  validate(brandSchemaValidator),
  createBrand
);

// list of brand
router.get("/", authenticate, authorize(["inventory:manage"]), brandList);

// individual brand info
router.get("/:id", authenticate, authorize(["inventory:manage"]), brandInfo);

// update brand
router.put(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  validate(updateBrandValidator),
  updateBrand
);

// delete brand
router.delete(
  "/:id",
  authenticate,
  authorize(["inventory:manage"]),
  deleteBrand
);

export default router;
