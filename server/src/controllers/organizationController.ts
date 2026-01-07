/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import { createOrganizationValidator } from "../validators/organizationValidator";
import Organization from "../models/OrganizationModel";

const createOrganization = async (req: AuthRequest, res: Response) => {
    try {
        // Validate request body using Zod
        const validationResult = createOrganizationValidator.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.error.issues.map((err: { path: any[]; message: any; }) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        const {
            name,
            tradeLicenseNo,
            drugLicenseNo,
            vatRegistrationNo,
            address,
            contact,
            subscriptionPlan
        } = validationResult.data;

        // check duplicate rganization name 
        const existingOrg = await Organization.findOne({
            $or: [
                { name },
                { tradeLicenseNo },
                { drugLicenseNo }
            ]
        });

        if (existingOrg) {
            return res.status(409).json({
                success: false,
                message: "Organization alreday exist with same name and license"
            })
        };

        // create organizaion 
        const organization = await Organization.create({
            name,
            tradeLicenseNo,
            drugLicenseNo,
            vatRegistrationNo,
            address,
            contact,
            subscriptionPlan,
            createdBy: req.user?.userId,
            isActive: true
        });

        // success response 
        return res.status(201).json({
            success: true,
            message: "Organization created successfully.",
            data: { organization }
        })
    } catch (error) {
        console.error('Create organization error:', error);

        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
}

export { createOrganization }