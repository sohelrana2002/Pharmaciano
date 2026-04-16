import { z } from "zod";
import { AuthRequest } from "../types";
import { isSuperAdmin } from "../middlewares/auth.middleware";

const purchaseItem = z.object({
  medicineName: z
    .string({ error: "medicine name is required!" })
    .min(1, "Medicine name at least 1 character!"),
  batchNo: z.string().optional(),
  expiryDate: z.coerce.date().optional(),
  quantity: z
    .number({ error: "Quantity is required!" })
    .min(1, "At least 1 quantity is required!"),
  purchasePrice: z.number().optional(),
});

// UPDATE ITEM (FULL OPTIONAL)
export const purchaseItemUpdate = purchaseItem.partial();

const basePurchaseSchemaValidator = z.object({
  items: z.array(purchaseItem).min(1, "At least 1 item is required"),
  status: z.enum(["pending", "approved", "received"]).default("pending"),
  supplier: z
    .string({ error: "Supplier company name is required!" })
    .min(1, "Supplier company name at least 1 character long"),
  discount: z.number().nonnegative().optional().default(0),
  tax: z.number().nonnegative().optional().default(0),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]).default("unpaid"),
  paidAmount: z.number().nonnegative().optional().default(0),
  approvedBy: z.any().optional(),
  warehouseName: z
    .string({ error: "Warehouse name is required!" })
    .min(1, "Warehouse name at least 1 character long")
    .lowercase(),
});

export const createPurchaseSchemaValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return basePurchaseSchemaValidator.extend({
    organizationName: superAdmin
      ? z
          .string({ error: "Organization name is required for super admin" })
          .min(1, "Organization name is at least 1 character")
      : z.string().optional(),

    branchName: superAdmin
      ? z
          .string({ error: "Branch name is required for superadmin" })
          .min(1, "Branch name is at least 1 character")
      : z.string().optional(),
  });
};

export const updatePurchaseSchemaValidator = z
  .object({
    items: z.array(purchaseItemUpdate).optional(),
    discount: z.number({ error: "Discount is required!" }).nonnegative(),
    tax: z.number({ error: "Tax is required!" }).nonnegative(),
    paymentStatus: z.enum(["unpaid", "partial", "paid"]),
    paidAmount: z.number({ error: "Paid amount is required!" }).nonnegative(),
    warehouseName: z
      .string({ error: "Warehouse name is required!" })
      .min(1, "Warehouse name at least 1 character long")
      .lowercase(),
  })
  .superRefine((data, ctx) => {
    // optional validation only if items exist
    if (data.items) {
      data.items.forEach((item, index) => {
        if (item.medicineName === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["items", index, "medicineName"],
            message: "medicine name is required when updating item",
          });
        }

        if (item.batchNo === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["items", index, "batchNo"],
            message: "batchNo is required when updating item",
          });
        }

        if (item.expiryDate === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["items", index, "expiryDate"],
            message: "expiryDate is required when updating item",
          });
        }

        if (
          item.purchasePrice == null ||
          typeof item.purchasePrice !== "number"
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["items", index, "purchasePrice"],
            message: "purchasePrice is required when updating item",
          });
        }
      });
    }
  });
