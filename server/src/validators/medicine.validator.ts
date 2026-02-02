import { z } from "zod";

export const medicineSchemaValidator = z.object({
  name: z
    .string({ error: "Medicine name is required!" })
    .min(1, "Medicine name is at least 1 character!")
    .toLowerCase()
    .trim(),
  genericName: z
    .string({ error: "Generic name is required!" })
    .min(1, "Generic name is at least 1 character!")
    .toLowerCase()
    .trim(),
  categoryName: z
    .string({ error: "Category name is required!" })
    .min(1, "Category name is at least 1 character!")
    .toLowerCase()
    .trim(),
  brandName: z
    .string({ error: "Brand name is required!" })
    .min(1, "Brand name is at least 1 character!")
    .toLowerCase()
    .trim(),
  dosageForm: z
    .string({ error: "Dosage Form is required!" })
    .min(1, "Dosage Form is at least 1 character!")
    .toLowerCase()
    .trim(),
  strength: z
    .string({ error: "Strength is required!" })
    .min(1, "Strength is at least 1 character!")
    .toLowerCase()
    .trim(),
  unit: z
    .string({ error: "Unit is required!" })
    .min(1, "Unit is at least 1 character!")
    .toLowerCase()
    .trim(),
  mrp: z
    .number({ error: "MRP is required!" })
    .min(0, "MRP must be non-negative!"),
  isPrescriptionRequired: z.boolean().optional().default(false),
  taxRate: z.number().min(0).optional().default(0),
});

// Validator for updating a brand (all fields optional)
export const updateMedicineValidator = medicineSchemaValidator.partial();
