import { z } from "zod";

export const warehousSchemaValidator = z.object({
  name: z
    .string({ error: "Warehouse name is required." })
    .min(1, "Warehouse name must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  location: z
    .string({ error: "Warehouse location is required." })
    .min(1, "Warehouse location must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  capacity: z
    .number({ error: "Warehouse capacity is required." })
    .optional()
    .default(0),
  branchName: z
    .string({ error: "Branch name is required." })
    .min(1, "Branch name must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  isActive: z.boolean().optional().default(true),
});

// Validator for updating a brand (all fields optional)
export const updateWarehouseValidator = warehousSchemaValidator.partial();
