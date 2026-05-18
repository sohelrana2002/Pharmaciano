import { Router } from "express";
import { autoDemandInsights } from "../controllers/aiinsight.controller";

const router = Router();

router.get("/auto/demand", autoDemandInsights);

export default router;
