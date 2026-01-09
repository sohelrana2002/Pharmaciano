import { z } from "zod";

export const createUserValidator = z.object({
  email: z
    .string({ error: "Email is required!" })
    .email("Please provide a valid email address!")
    .min(1, "Email is required!"),

  password: z
    .string({ error: "Password is required!" })
    .min(6, "Password must be at least 6 characters long"),

  name: z
    .string({ error: "Name is required!" })
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be less than 50 characters")
    .toLowerCase(),

  role: z.string().toLowerCase().optional(),

  isActive: z.boolean().optional().default(true),
});

// Validator for updating a user (all fields optional)
export const updateUserValidator = createUserValidator.partial();
