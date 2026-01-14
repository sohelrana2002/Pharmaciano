import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { branchSchemaValidator } from "../validators/branch.validator";

const router = Router();
