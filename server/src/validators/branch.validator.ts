import { z } from "zod";

export const branchSchemaValidator = z.object({
  name: z
    .string({ error: "Branch name is required." })
    .min(1, "Branch name must be at least 1 characters long")
    .toLowerCase()
    .trim(),

  address: z
    .string({ error: "Address is required." })
    .min(1, "Address must be at least 1 characters long")
    .toLowerCase()
    .trim(),

  contact: z.object({
    phone: z
      .string({ error: "Phone number is required!" })
      .regex(/^01\d{9}$/, "Phone number must start with 01 and be 11 digits"),

    email: z
      .string({ error: "Email is required!" })
      .email({ error: "Invalid email address" }),
  }),

  orgName: z
    .string({ error: "Organization name is required." })
    .min(1, "Organization name must be at least 1 characters long")
    .toLowerCase()
    .trim(),
});

// Validator for updating a organization (all fields optional)
export const updateBranchVaidator = branchSchemaValidator.partial();
