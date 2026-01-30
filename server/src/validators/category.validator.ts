import { z } from "zod";

export const categorySchemaValidator = z.object({
  name: z
    .string({ error: "Category name is required." })
    .min(1, "Category name must be at least 1 characters long")
    .toLowerCase()
    .trim(),

  description: z
    .string({ error: "category description is required." })
    .min(1, "category description must be at least 1 characters long")
    .toLowerCase(),
});

// Validator for updating a brand (all fields optional)
export const updateCategoryValidator = categorySchemaValidator.partial();
