/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import { branchSchemaValidator } from "../validators/branch.validator";
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

    const branch = await Branch.findOne({ _id: id }).populate({
      path: "organization",
      select: "-_id",
      populate: {
        path: "createdBy",
        select: "name email",
      },
    });

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
export { createBranch, branchList, branchInfo };
