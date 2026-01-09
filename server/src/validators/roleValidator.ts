import { z } from "zod";

export const roleSchemaValidator = z.object({
  name: z
    .string({ error: "Role name is required!" })
    .min(1, "Role name must be at least 1 characters long")
    .toLowerCase()
    .trim(),

  description: z
    .string({ error: "Description is required!" })
    .min(1, "Description must be at least 1 characters long")
    .toLowerCase(),

  features: z.preprocess(
    (arg) => (typeof arg === "string" ? arg.split(",") : arg),
    z
      .array(z.string().min(1, "Feature must be required."))
      .nonempty("At least one feature is required")
  ),

  createdBy: z.any().optional(),

  isActive: z.boolean().optional().default(true),
});

// Validator for updating a user (all fields optional)
export const updateRoleValidator = roleSchemaValidator.partial();
