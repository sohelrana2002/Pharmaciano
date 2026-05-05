import { IJournalEntry } from "../types";

import { Schema, model } from "mongoose";

const journalEntrySchema = new Schema<IJournalEntry>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    debitAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    creditAccountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["Sale", "Purchase", "Expense", "Drawing", "Capital", "Manual"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: "referenceType",
    },
    note: {
      type: String,
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const JournalEntry = model<IJournalEntry>(
  "JournalEntry",
  journalEntrySchema,
);
