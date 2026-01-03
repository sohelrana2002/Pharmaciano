import { Router } from "express";
import { createBrand, brandList } from "../controllers/brandController";
import { validate } from "../middlewares/validateMiddleware";
import { brandSchemaValidator } from "../validators/brandValidator";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// create brand 
router.post("/", authenticate, authorize(["inventory:manage"]), validate(brandSchemaValidator), createBrand);

// list of brand 
router.get("/", authenticate, authorize(["inventory:manage"]), brandList);

export default router;