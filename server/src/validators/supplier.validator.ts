import { z } from "zod";

export const supplierSchemaValidator = z.object({
  name: z
    .string({ error: "Supplier name is required!" })
    .min(1, "Supplier name must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  contactPerson: z
    .string({ error: "Supplier contact person is required!" })
    .min(1, "Supplier contact person must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  phone: z
    .string({ error: "Phone number is required!" })
    .regex(/^01\d{9}$/, "Phone number must start with 01 and be 11 digits"),
  email: z
    .string({ error: "Email is required!" })
    .email({ error: "Invalid email address" }),
  address: z
    .string({ error: "Supplier address is required!" })
    .min(1, "Supplier address must be at least 1 characters long")
    .toLowerCase()
    .trim(),
  isActive: z.boolean().optional().default(true),
});

// Validator for updating a supplier (all fields optional)
export const updateSupplierValidator = supplierSchemaValidator.partial();
