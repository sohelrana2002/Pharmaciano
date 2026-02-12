import { z } from "zod";

export const createUserValidator = z
  .object({
    email: z
      .string({ error: "Email is required!" })
      .email("Please provide a valid email address!")
      .min(1, "Email is required!"),
    password: z
      .string({ error: "Password is required!" })
      .min(6, "Password must be at least 6 characters long"),
    name: z
      .string({ error: "Name is required!" })
      .min(1, "Name must be at least 1 characters long")
      .max(50, "Name must be less than 50 characters")
      .toLowerCase(),
    orgName: z
      .string({ error: "Organization name is required!" })
      .min(1, "Organization name must be at least 1 characters long")
      .max(50, "Organization name must be less than 50 characters")
      .toLowerCase()
      .optional(),
    branchName: z
      .string({ error: "Branch name is required!" })
      .min(1, "Branch name must be at least 1 characters long")
      .max(50, "Branch name must be less than 50 characters")
      .toLowerCase()
      .optional(),
    warehouseName: z
      .string({ error: "Warehouse name is required!" })
      .min(1, "Warehouse name must be at least 1 characters long")
      .max(50, "Warehouse name must be less than 50 characters")
      .toLowerCase()
      .optional(),
    role: z.string().toLowerCase().optional(),
    isActive: z.boolean().optional().default(true),
    phone: z
      .string({ error: "Phone number is required!" })
      .regex(/^01\d{9}$/, "Phone number must start with 01 and be 11 digits")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "Super Admin") {
      if (!data.orgName) {
        ctx.addIssue({
          path: ["orgName"],
          message: "Organization name is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.branchName) {
        ctx.addIssue({
          path: ["branchName"],
          message: "Branch name is required",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.phone) {
        ctx.addIssue({
          path: ["phone"],
          message: "Phone number is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

// Validator for updating a user (all fields optional)
export const updateUserValidator = createUserValidator.partial();
