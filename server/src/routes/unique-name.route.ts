import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { uniqueNameList } from "../shared/uniqueName.controller";

const router = Router();

// all necessary unique name
router.get("/", authenticate, uniqueNameList);

export default router;
