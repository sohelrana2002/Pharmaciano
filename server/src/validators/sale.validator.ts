import { z } from "zod";

export const salesItemSchema = z.object({
  batchNo: z
    .string({ error: "Batch no is required!" })
    .min(1, "Batch no at least 1 character!")
    .trim(),
  quantity: z.number({ error: "Quantity is required!" }),
  sellingPrice: z.number({ error: "Selling price is required!" }),
});

export const saleSchemaValidator = z.object({
  customerName: z
    .string({ error: "Customer name is required" })
    .min(1, "Customer name at least 1 character long")
    .toLowerCase()
    .trim(),
  customerPhone: z
    .string({ error: "Customer phone number is required!" })
    .regex(
      /^01\d{9}$/,
      "Customer phone number must start with 01 and be 11 digits",
    ),
  items: z.array(salesItemSchema).min(1, "At least 1 drugs need to add."),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
  paymentMethod: z.enum(["cash", "card", "mobile"]),
});
