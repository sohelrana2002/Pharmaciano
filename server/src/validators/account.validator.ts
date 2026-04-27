import { z } from "zod";
import { AuthRequest } from "../types";
import { isSuperAdmin } from "../middlewares/auth.middleware";

const ACCOUNT_TYPES = [
  "asset",
  "liability",
  "income",
  "expense",
  "equity",
] as const;

const baseAccountSchema = z.object({
  name: z
    .string({ error: "Account name is required!" })
    .min(1, "Account name at least 1 character")
    .trim(),
  type: z.enum(ACCOUNT_TYPES, {
    error:
      "Account type must be one of: asset, liability, income, expense, equity",
  }),
  code: z
    .string({ error: "Account code is required!" })
    .min(1, "Account code at least 1 character"),
  isActive: z.boolean().optional().default(true),
});

export const createAccountValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return baseAccountSchema.extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),
  });
};

// Validator for updating account (all fields optional)
export const updateAccountValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return baseAccountSchema.partial().extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),
  });
};
