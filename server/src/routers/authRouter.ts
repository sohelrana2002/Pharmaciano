import { Router } from "express";
import { login, getProfile } from "../controllers/authController";
import { authenticate, authorize } from "../middlewares/authMiddleware";

const router = Router();

// login method
router.post("/login", login);

// get individual profile info
router.get("/profile", authenticate, authorize(["user:read"]), getProfile);

export default router;
