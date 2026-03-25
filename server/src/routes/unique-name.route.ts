import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { uniqueNameList } from "../shared/uniqueName.controller";

const router = Router();

// all necessary unique name
router.get(
  "/",
  authenticate,
  authorize(["user:manage", "role:manage"]),
  uniqueNameList,
);

export default router;
