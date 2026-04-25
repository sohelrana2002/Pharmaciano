import { z } from "zod";
import { AuthRequest } from "../types";
import { isSuperAdmin } from "../middlewares/auth.middleware";

const baseBrandValidator = z.object({
  name: z
    .string({ error: "Brand name is required." })
    .min(1, "Brand name must be at least 1 characters long")
    .toLowerCase()
    .trim(),

  manufacturer: z
    .string({ error: "Manufacturer is required." })
    .min(1, "Manufacturer must be at least 1 characters long")
    .toLowerCase(),

  country: z
    .string({ error: "Country name is required." })
    .min(1, "Country name must be at least 1 characters long")
    .toLowerCase(),
  isActive: z.boolean().optional().default(true),
});

export const brandSchemaValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return baseBrandValidator.extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),
  });
};

// Validator for updating a brand (all fields optional)
export const updateBrandValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return baseBrandValidator.partial().extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),
  });
};
