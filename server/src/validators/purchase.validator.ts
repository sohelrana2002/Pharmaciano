import { z } from "zod";
import { AuthRequest } from "../types";
import { isSuperAdmin } from "../middlewares/auth.middleware";

const purchaseItem = z.object({
  medicineName: z
    .string({ error: "medicine name is required!" })
    .min(1, "Medicine name at least 1 character!"),
  batchNo: z.string().optional(),
  expiryDate: z.date().optional(),
  quantity: z
    .number({ error: "Quantity is required!" })
    .min(1, "At least 1 quantity is required!"),
  purchasePrice: z.number().optional().default(0),
});

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
  warehouseName: z.string().optional(),
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

export const updatePurchaseSchemaValidator = (req: AuthRequest) => {
  const superAdmin = isSuperAdmin(req.user);

  return basePurchaseSchemaValidator
    .partial()
    .extend({
      organizationName: superAdmin
        ? z
            .string({ error: "Organization name is required for super admin" })
            .min(1, "Organization name is at least 1 character")
            .optional()
        : z.string().optional(),

      branchName: superAdmin
        ? z
            .string({ error: "Branch name is required for superadmin" })
            .min(1, "Branch name is at least 1 character")
            .optional()
        : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.items) {
        data.items.forEach((item, index) => {
          if (!item.batchNo) {
            ctx.addIssue({
              code: "custom",
              path: ["items", index, "batchNo"],
              message: "batchNo is required when updating item",
            });
          }

          if (!item.expiryDate) {
            ctx.addIssue({
              code: "custom",
              path: ["items", index, "expiryDate"],
              message: "expiryDate is required when updating item",
            });
          }

          if (item.purchasePrice === undefined || item.purchasePrice === null) {
            ctx.addIssue({
              code: "custom",
              path: ["items", index, "purchasePrice"],
              message: "purchasePrice is required when updating item",
            });
          }
        });
      }

      if (data.status === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["status"],
          message: "status is required when updating purchase",
        });
      }

      if (data.paymentStatus === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["paymentStatus"],
          message: "payment status is required when updating purchase",
        });
      }

      if (data.paidAmount === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["paidAmount"],
          message: "paidAmount is required when updating purchase",
        });
      }

      if (data.approvedBy === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["approvedBy"],
          message: "approvedBy is required when updating purchase",
        });
      }

      if (data.warehouseName === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["warehouseName"],
          message: "warehouse name is required when updating purchase",
        });
      }
    });
};
