import { z } from "zod";

export const inventoryBatchSchemaValidator = z.object({
  medicineName: z
    .string({ error: "Medicine name is required!" })
    .min(1, "Medicine name at least 1 character!")
    .toLowerCase()
    .trim(),
  batchNo: z
    .string({ error: "Batch No is required!" })
    .min(1, "Batch No at least 1 character!")
    .trim(),
  expiryDate: z.coerce.date({ error: "Expiry date must be a valid date" }),
  quantity: z.number({ error: "Quantity is required!" }),
  purchasePrice: z.number({ error: "Purchase Price is required!" }),
  status: z
    .enum(["active", "expired"], {
      error: "Status must be either 'active' or 'expired'",
    })
    .default("active"),
  warehouseName: z
    .string({ error: "Warehouse name is required!" })
    .min(1, "Warehouse name at least 1 character!")
    .toLowerCase()
    .trim(),
});

// Validator for updating a brand (all fields optional)
export const updateInventoryBatchValidator =
  inventoryBatchSchemaValidator.partial();
