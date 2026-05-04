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
      enum: ["sale", "purchase", "expense"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    note: {
      type: String,
    },
  },
  { timestamps: true },
);

export const JournalEntry = model<IJournalEntry>(
  "JournalEntry",
  journalEntrySchema,
);
