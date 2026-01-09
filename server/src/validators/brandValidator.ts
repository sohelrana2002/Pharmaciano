import { z } from "zod";

export const brandSchemaValidator = z.object({
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
});

// Validator for updating a brand (all fields optional)
export const updateBrandValidator = brandSchemaValidator.partial();
