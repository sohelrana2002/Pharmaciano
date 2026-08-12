import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { getSalesReport } from "../controllers/report.controller";

const router = Router();

router.get(
  "/sales",
  authenticate,
  authorize(["reports:manage", "superAdmin:manage"]),
  getSalesReport,
);

export default router;
