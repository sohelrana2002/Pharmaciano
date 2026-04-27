import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAccountValidator } from "../validators/account.validator";
import { createAccount } from "../controllers/account.controller";

const router = Router();

// create account
router.post(
  "/",
  authenticate,
  authorize(["account:manage", "superAdmin:manage"]),
  validate(createAccountValidator),
  createAccount,
);

export default router;
