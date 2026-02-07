/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import { customMessage } from "../constants/customMessage";
import { warehousSchemaValidator } from "../validators/warehouse.validator";
import Warehouse from "../models/Warehouse.model";
import Branch from "../models/Branch.model";

// create warehouse
const createWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = warehousSchemaValidator.safeParse(req.body);

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

    const { name, location, capacity, branchName, isActive } =
      validationResult.data;

    //   check if warehouse already exist
    const existingWarehouse = await Warehouse.findOne({ name });

    if (existingWarehouse) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Warehouse"),
      });
    }

    //   fetch all active branch
    const activeBranch = await Branch.find({ isActive: true }).select("name");

    //   find branch name, exist or not
    const branch = await Branch.findOne({ name: branchName });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch name.",
        hint: `Available branch name are ${activeBranch
          .map((branch) => branch.name)
          .join(", ")}`,
      });
    }

    const warehouse = await Warehouse.create({
      name,
      location,
      capacity,
      branch: branch._id,
      isActive,
      createdBy: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Warehouse"),
      id: warehouse!._id,
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

    console.error("create warehouse error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createWarehouse };
