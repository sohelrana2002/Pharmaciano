import { z } from "zod";

export const createOrganizationValidator = z.object({
    name: z.string({ error: "Organization name is required!" })
        .min(2, { error: "Organization name at least 2 chaeacter!" })
        .toLowerCase()
        .trim(),

    tradeLicenseNo: z.string({ error: "Trade License No is required!" })
        .min(2, { error: "Trade License No at least 2 chaeacter!" })
        .toLowerCase()
        .trim(),

    drugLicenseNo: z.string({ error: "Drug License No is required!" })
        .min(2, { error: "Drug License No at least 2 chaeacter!" })
        .toLowerCase()
        .trim(),

    vatRegistrationNo: z.string({ error: "Vat Registration No is required!" })
        .min(2, { error: "Vat Registration No at least 2 chaeacter!" })
        .toLowerCase()
        .trim(),

    address: z.string({ error: "Address is required!" })
        .min(2, { error: "Address at least 2 chaeacter!" })
        .toLowerCase()
        .trim(),

    contact: z.object({
        phone: z.string({ error: "Phone number is required!" })
            .regex(/^01\d{9}$/, "Phone number must start with 01 and be 11 digits"),

        email: z.string({ error: "Email is required!" })
            .email({ error: "Invalid email address" })
    }),

    subscriptionPlan: z.enum(
        ["FREE", "BASIC", "PRO", "ENTERPRISE"],
        { error: "Subscription plan must be FREE, BASIC, PRO, or ENTERPRISE" }
    ).default("FREE")
});

// Validator for updating a organization (all fields optional)
export const updateOrganizationVaidator = createOrganizationValidator.partial();