/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import { createOrganizationValidator } from "../validators/organizationValidator";
import Organization from "../models/OrganizationModel";
import mongoose from "mongoose";

// create organization
const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = createOrganizationValidator.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map(
          (err: { path: any[]; message: any }) => ({
            field: err.path.join("."),
            message: err.message,
          })
        ),
      });
    }

    const {
      name,
      tradeLicenseNo,
      drugLicenseNo,
      vatRegistrationNo,
      address,
      contact,
      subscriptionPlan,
    } = validationResult.data;

    // check duplicate rganization name
    const existingOrg = await Organization.findOne({
      $or: [{ name }, { tradeLicenseNo }, { drugLicenseNo }],
    });

    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: "Organization alreday exist with same name and license",
      });
    }

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
      isActive: true,
    });

    // success response
    return res.status(201).json({
      success: true,
      message: "Organization created successfully.",
      data: { organization },
    });
  } catch (error: any) {
    //MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        message: `${value} already exists`,
        error: {
          field,
          value,
          reason: `${field} already exists`,
        },
      });
    }

    console.error("Create organization error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// list of organization
const organizationList = async (req: AuthRequest, res: Response) => {
  try {
    const organization = await Organization.find({ isActive: true }).select(
      "-createdBy"
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "No organization found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "List of organization.",
      data: { organization },
    });
  } catch (error) {
    console.error("List of organization error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// individual organization details info
const organizationInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const organization = await Organization.findOne({ _id: id }).populate(
      "createdBy",
      "name email"
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Individual organization info.",
      data: { organization },
    });
  } catch (error) {
    console.error("Individual organization info error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// delete Organization
const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Organization deleted successfully!",
      id,
    });
  } catch (error) {
    console.error("Delete organization error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export {
  createOrganization,
  organizationList,
  organizationInfo,
  deleteOrganization,
};
