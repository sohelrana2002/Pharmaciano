import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { journalEntrySchemaValidator } from "../validators/journalEntry.validator";
import { createJournalEntry } from "../controllers/journalEntry.controller";

const router = Router();

// create journal entry
router.post(
  "/",
  authenticate,
  authorize(["superAdmin:manage"]),
  validate(journalEntrySchemaValidator),
  createJournalEntry,
);

export default router;
