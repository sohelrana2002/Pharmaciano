import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { journalEntrySchemaValidator } from "../validators/journalEntry.validator";
import {
  createJournalEntry,
  journalEntryInfo,
  journalEntryList,
  reverseJournal,
} from "../controllers/journalEntry.controller";

const router = Router();

// create journal entry
router.post(
  "/",
  authenticate,
  authorize(["superAdmin:manage"]),
  validate(journalEntrySchemaValidator),
  createJournalEntry,
);

// list of journal entry
router.get(
  "/",
  authenticate,
  authorize(["journal-entry:manage", "superAdmin:manage"]),
  journalEntryList,
);

// individual journal entry info
router.get(
  "/:id",
  authenticate,
  authorize(["journal-entry:manage", "superAdmin:manage"]),
  journalEntryInfo,
);

// reverse journal
router.post(
  "/:id/reverse",
  authenticate,
  authorize(["journal-entry:manage", "superAdmin:manage"]),
  reverseJournal,
);

export default router;
