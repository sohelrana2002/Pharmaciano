import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { getAiForecasting } from "../controllers/aiForecasting.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(["ai:manage", "superAdmin:manage"]),
  getAiForecasting,
);

export default router;
