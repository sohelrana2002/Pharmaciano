/* eslint-disable @typescript-eslint/no-explicit-any */
import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";
import { inventoryBatchSchemaValidator } from "../validators/inventoryBatch.validator";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import Medicine from "../models/Medicine.model";
import Warehouse from "../models/Warehouse.model";
import InventoryBatch from "../models/InventoryBatch.model";

// create inventoryBatch
const createInventoryBatch = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = inventoryBatchSchemaValidator.safeParse(req.body);

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
      orgName,
      branchName,
      medicineName,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseName,
    } = validationResult.data;

    //   check valid organization name
    const activeOrganization = await Organization.find({
      isActive: true,
    }).select("name");

    const organization = await Organization.findOne({ name: orgName });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid organization name.",
        hints: `Active organization names are ${activeOrganization.map((org) => org.name).join(", ")}`,
      });
    }

    //   check valid branch name
    const activeBranch = await Branch.find({
      isActive: true,
    }).select("name");

    const branch = await Branch.findOne({ name: branchName });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch name.",
        hints: `Active branch names are ${activeBranch.map((b) => b.name).join(", ")}`,
      });
    }

    //   check valid medicine name
    const activeMedicine = await Medicine.find({
      isActive: true,
    }).select("name");

    const medicine = await Medicine.findOne({ name: medicineName });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Invalid medicine name.",
        hints: `Active medicine names are ${activeMedicine.map((m) => m.name).join(", ")}`,
      });
    }

    //   check valid warehouse name
    const activeWarehouse = await Warehouse.find({
      isActive: true,
    }).select("name");

    const warehouse = await Warehouse.findOne({ name: warehouseName });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Invalid warehouse name.",
        hints: `Active warehouse names are ${activeWarehouse.map((w) => w.name).join(", ")}`,
      });
    }

    //   create inventoryBatch
    const inventoryBatch = await InventoryBatch.create({
      organizationId: organization._id,
      branchId: branch._id,
      medicineId: medicine._id,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseId: warehouse._id,
      status: new Date(expiryDate) < new Date() ? "expired" : "active",
      createdBy: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Inventory batch"),
      id: inventoryBatch!._id,
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

    console.error("Create medicine error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createInventoryBatch };
