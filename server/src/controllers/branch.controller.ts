/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import {
  branchSchemaValidator,
  updateBranchVaidator,
} from "../validators/branch.validator";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import mongoose from "mongoose";

// create branch
const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = branchSchemaValidator.safeParse(req.body);

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

    const { name, address, contact, orgName } = validationResult.data;

    //   Check if branch already exists
    const branchExist = await Branch.findOne({ name });

    if (branchExist) {
      return res.status(409).json({
        success: false,
        message: "Branch name already exist!",
      });
    }

    //   Fetch all active organization
    const activeOrganization = await Organization.find({
      isActive: true,
    }).select("name");
    // console.log("activeOrganization", activeOrganization);

    const organization = await Organization.findOne({ name: orgName });
    // console.log("organization", organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid organization name",
        hint: `Available organization names are ${activeOrganization.map(
          (org) => org.name,
        )}`,
      });
    }

    const branch = new Branch({
      name,
      address,
      contact,
      organization: organization._id,
      createdBy: req.user!.userId,
    });

    await branch.save();

    return res.status(201).json({
      success: true,
      message: "Branch created successfully!",
      id: branch._id,
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

    console.error("Create branch error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// list of branch
const branchList = async (req: AuthRequest, res: Response) => {
  try {
    const branch = await Branch.find({ isActive: true }).select(
      "-createdBy -organization",
    );

    if (!branch) {
      res.status(404).json({
        success: false,
        message: "Branch not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch list",
      length: branch.length,
      data: { branch },
    });
  } catch (error: any) {
    console.error("List of branch error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// individual branch info
const branchInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const branch = await Branch.findById(id).populate([
      {
        path: "organization",
        select: "name address contact -_id",
      },
      {
        path: "createdBy",
        select: "name email -_id",
      },
    ]);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Individual branch info.",
      data: { branch },
    });
  } catch (error: any) {
    console.error("Individual branch info error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// update branch
const updateBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // Validate request body using Zod
    const validationResult = updateBranchVaidator.safeParse(req.body);

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

    const { name, address, contact, orgName } = validationResult.data;

    const branchExist = await Branch.findById(id);

    if (!branchExist) {
      return res.status(404).json({
        success: false,
        message: "Branch not found!",
      });
    }

    // Prevent duplicate fields (industry practice)
    if (name && name != branchExist.name) {
      const existing = await Branch.findOne({ name });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Branch name already exist.",
        });
      }
    }

    // Build update data dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;

    //   Fetch all active organization
    const activeOrganization = await Organization.find({
      isActive: true,
    }).select("name");

    // console.log("activeOrganization", activeOrganization);

    const organization = await Organization.findOne({ name: orgName });
    // console.log("organization", organization);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid organization name",
        hint: `Available organization names are ${activeOrganization.map(
          (org) => org.name,
        )}`,
      });
    }
    updateData.organization = organization._id;

    // Update Branch
    const updateResult = await Branch.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Branch updated successfully.",
      id: updateResult!._id,
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

    console.error("update branch error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// delete branch
const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    const branch = await Branch.findByIdAndDelete(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Branch deleted successfully!",
      id,
    });
  } catch (error: any) {
    console.error("Delete branch error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { createBranch, branchList, branchInfo, deleteBranch, updateBranch };
