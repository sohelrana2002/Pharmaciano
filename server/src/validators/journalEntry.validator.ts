import { z } from "zod";
import { AuthRequest } from "../types";
import { isSuperAdmin } from "../middlewares/auth.middleware";

const REFERENCE_TYPES = [
  "sale",
  "purchase",
  "expense",
  "drawing",
  "capital",
  "manual",
] as const;

const baseJournalEntrySchema = z.object({
  debitAccountId: z.string({ error: "debitAccountId is required!" }),
  creditAccountId: z.string({ error: "creditAccountId is required" }),
  amount: z
    .number({ error: "Amount is required!" })
    .min(1, "Amount at least 1 digit"),
  referenceType: z.enum(REFERENCE_TYPES, {
    error:
      "Reference type must be one of: sale, purchase, expense, drawing, capital, manual",
  }),
  referenceId: z.string().optional(),
  note: z.string().optional(),
  isReversed: z.boolean().default(false),
});

export const journalEntrySchemaValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return baseJournalEntrySchema.extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),

    branchName: superAdmin
      ? z
          .string({ error: "Branch name is required for superadmin" })
          .min(1, "Branch name is at least 1 character")
      : z.string().optional(),
  });
};
