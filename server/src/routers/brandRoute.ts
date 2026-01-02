import { Router } from "express";
import { createBrand } from "../controllers/brandController";
import { validate } from "../middlewares/validateMiddleware";
import { brandSchemaValidator } from "../validators/brandValidator";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// create brand 
router.post("/", authenticate, authorize(["inventory:manage"]), validate(brandSchemaValidator), createBrand);

export default router;