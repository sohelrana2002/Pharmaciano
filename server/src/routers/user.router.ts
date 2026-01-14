import { Router } from "express";
import {
  createUser,
  userList,
  userProfile,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createUserValidator,
  updateUserValidator,
} from "../validators/auth.validator";
import { validate } from "../middlewares/validate.middleware";
import { authorize } from "../middlewares/auth.middleware";

const router = Router();

// create user
router.post(
  "/",
  authenticate,
  authorize(["user:create"]),
  validate(createUserValidator),
  createUser
);

// list of users
router.get("/", authenticate, authorize(["user:list"]), userList);

// individual profile info
router.get("/profile", authenticate, authorize(["user:read"]), userProfile);

// update user
router.put(
  "/:id",
  authenticate,
  authorize(["user:update"]),
  validate(updateUserValidator),
  updateUser
);

// delete user
router.delete("/:id", authenticate, authorize(["user:delete"]), deleteUser);

export default router;
