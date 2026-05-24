import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { downloadFullDatabase } from "../controllers/database.controller";

const router = Router();

// download all collection
router.get(
  "/download",
  authenticate,
  authorize(["superAdmin:manage"]),
  downloadFullDatabase,
);

export default router;
