/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import {
  createOrganizationValidator,
  updateOrganizationVaidator,
} from "../validators/organization.validator";
import Organization from "../models/Organization.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

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
          }),
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
      message: customMessage.created("Organization"),
      id: organization._id,
    });
  } catch (error: any) {
    //MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists(value),
        error: {
          field,
          value,
          reason: customMessage.alreadyExists(field),
        },
      });
    }

    console.error("Create organization error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of organization
const organizationList = async (req: AuthRequest, res: Response) => {
  try {
    const organization = await Organization.find({ isActive: true }).select(
      "-createdBy",
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("List of organization"),
      length: organization.length,
      data: { organization },
    });
  } catch (error) {
    console.error("List of organization error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
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
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const organization = await Organization.findById(id).populate(
      "createdBy",
      "name email -_id",
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Individual organization info"),
      data: { organization },
    });
  } catch (error) {
    console.error("Individual organization info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update Organization
const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    // Validate request body using Zod
    const validationResult = updateOrganizationVaidator.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map(
          (err: { path: any[]; message: any }) => ({
            field: err.path.join("."),
            message: err.message,
          }),
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

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization", id),
      });
    }

    // Prevent duplicate fields (industry practice)
    if (name && name !== organization.name) {
      const existing = await Organization.findOne({ name });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Organization name already exists.",
        });
      }
    }

    if (tradeLicenseNo && tradeLicenseNo !== organization.tradeLicenseNo) {
      const existing = await Organization.findOne({
        tradeLicenseNo,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Trade license number already exists.",
        });
      }
    }

    if (drugLicenseNo && drugLicenseNo !== organization.drugLicenseNo) {
      const existing = await Organization.findOne({
        drugLicenseNo,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Drug license number already exists.",
        });
      }
    }

    // Build update data dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (tradeLicenseNo) updateData.tradeLicenseNo = tradeLicenseNo;
    if (drugLicenseNo) updateData.drugLicenseNo = drugLicenseNo;
    if (vatRegistrationNo) updateData.vatRegistrationNo = vatRegistrationNo;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    if (subscriptionPlan) updateData.subscriptionPlan = subscriptionPlan;

    // Update organization
    const updateResult = await Organization.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Organization", id),
      id: updateResult!._id,
    });
  } catch (error: any) {
    //MongoDB Duplicate Key Error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists(value),
        error: {
          field,
          value,
          reason: customMessage.alreadyExists(field),
        },
      });
    }

    console.error("update organization error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
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
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const organization = await Organization.findByIdAndDelete(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Organization", id),
      id,
    });
  } catch (error) {
    console.error("Delete organization error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createOrganization,
  organizationList,
  organizationInfo,
  updateOrganization,
  deleteOrganization,
};
