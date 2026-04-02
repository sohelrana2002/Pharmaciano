/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRequest } from "../types";
import { Response } from "express";
import {
  branchSchemaValidator,
  updateBranchVaidator,
} from "../validators/branch.validator";
import Branch from "../models/Branch.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

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

    const { name, address, contact, isActive } = validationResult.data;

    //   Check if branch already exists
    const branchExist = await Branch.findOne({
      name,
      organizationId: req.user!.organizationId,
    });

    if (branchExist) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Branch name"),
      });
    }

    const branch = new Branch({
      name,
      address,
      contact,
      isActive,
      organizationId: req.user!.organizationId,
      createdBy: req.user!.userId,
    });

    await branch.save();

    return res.status(201).json({
      success: true,
      message: customMessage.created("Branch"),
      id: branch._id,
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

    console.error("Create branch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of branch
const branchList = async (req: AuthRequest, res: Response) => {
  try {
    const { name, isActive, page, limit } = req.query;

    const baseFilter: any = {
      organizationId: req.user!.organizationId,
    };

    const filter: any = { ...baseFilter };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const branch = await Branch.find(filter)
      .populate([
        {
          path: "organizationId",
          select: "name",
        },
        {
          path: "createdBy",
          select: "name email",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    if (!branch) {
      res.status(404).json({
        success: false,
        message: customMessage.notFound("Branch"),
      });
    }

    const total = await Branch.countDocuments({ ...baseFilter });

    const activeCount = await Branch.countDocuments({
      ...baseFilter,
      isActive: true,
    });

    const inActiveCount = await Branch.countDocuments({
      ...baseFilter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        branch.length > 0 ? customMessage.found("Branch") : "No branch found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: branch.length,
      },
      total,
      active: activeCount,
      inActive: inActiveCount,
      data: { branch },
    });
  } catch (error: any) {
    console.error("List of branch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
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
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const branch = await Branch.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    }).populate([
      {
        path: "organizationId",
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
        message: customMessage.notFound("Branch", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Individual branch info"),
      data: { branch },
    });
  } catch (error: any) {
    console.error("Individual branch info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
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
        message: customMessage.invalidId("Mongoose", id),
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

    const { name, address, contact, isActive } = validationResult.data;

    const branchExist = await Branch.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!branchExist) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Branch"),
      });
    }

    // Prevent duplicate fields (industry practice)
    if (name && name != branchExist.name) {
      const existing = await Branch.findOne({
        name,
        organizationId: req.user!.organizationId,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("Branch name"),
        });
      }
    }

    // Build update data dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (contact) updateData.contact = contact;
    if (isActive) updateData.isActive = isActive;

    // Update Branch
    const updateResult = await Branch.findByIdAndUpdate(
      {
        _id: id,
        organizationId: req.user!.organizationId,
      },
      updateData,
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Branch", id),
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

    console.error("update branch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
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
        message: customMessage.invalidId("Branch", id),
      });
    }

    const branch = await Branch.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Branch", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Branch", id),
      id,
    });
  } catch (error: any) {
    console.error("Delete branch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createBranch, branchList, branchInfo, deleteBranch, updateBranch };
