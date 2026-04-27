import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createAccountValidator } from "../validators/account.validator";
import {
  accountInfo,
  accountList,
  createAccount,
} from "../controllers/account.controller";

const router = Router();

// create account
router.post(
  "/",
  authenticate,
  authorize(["account:manage", "superAdmin:manage"]),
  validate(createAccountValidator),
  createAccount,
);

// list of accounts
router.get(
  "/",
  authenticate,
  authorize(["account:manage", "superAdmin:manage"]),
  accountList,
);

// individual account info
router.get(
  "/:id",
  authenticate,
  authorize(["account:manage", "superAdmin:manage"]),
  accountInfo,
);

export default router;
