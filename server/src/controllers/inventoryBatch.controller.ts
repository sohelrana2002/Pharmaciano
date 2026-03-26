/* eslint-disable @typescript-eslint/no-explicit-any */
import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";
import {
  inventoryBatchSchemaValidator,
  updateInventoryBatchValidator,
} from "../validators/inventoryBatch.validator";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import Medicine from "../models/Medicine.model";
import Warehouse from "../models/Warehouse.model";
import InventoryBatch from "../models/InventoryBatch.model";
import mongoose from "mongoose";

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

    const existingBatchNo = await InventoryBatch.findOne({ batchNo });

    if (existingBatchNo) {
      return res.status(409).json({
        success: false,
        message: "Medicine batch No already exist.",
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

    console.error("Create inventory batch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of inventoryBatch
const inventoryBatchList = async (req: AuthRequest, res: Response) => {
  try {
    const inventoryBatch = await InventoryBatch.find()
      .populate([
        {
          path: "medicineId",
          select: "name -_id",
        },
        {
          path: "organizationId",
          select: "name -_id",
        },
        {
          path: "branchId",
          select: "name -_id",
        },
        {
          path: "warehouseId",
          select: "name -_id",
        },
      ])
      .select("-createdBy");

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Inventory batch"),
      length: inventoryBatch.length,
      data: { inventoryBatch },
    });
  } catch (error) {
    console.error("List of inventory batch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual inventoryBatch info
const inventoryBatchInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const inventoryBatch = await InventoryBatch.findById(id).populate([
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "branchId",
        select: "name contact address -_id",
      },
      {
        path: "medicineId",
        select: "-brandId -categoryId -createdBy -_id",
      },
      {
        path: "warehouseId",
        select: "name location -_id",
      },
      {
        path: "createdBy",
        select: "name email -_id",
      },
    ]);

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Inventory batch", id),
      date: { inventoryBatch },
    });
  } catch (error) {
    console.error("Individual inventory batch info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update inventory batch
const updateInventoryBatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    // Validate request body using Zod
    const validationResult = updateInventoryBatchValidator.safeParse(req.body);

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

    const inventoryBatch = await InventoryBatch.findById(id);

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch", id),
      });
    }

    //   prevent duplicate batch no
    if (batchNo && batchNo !== inventoryBatch.batchNo) {
      const existingBatchNo = await InventoryBatch.findOne({ batchNo });

      if (existingBatchNo) {
        return res.status(409).json({
          success: false,
          message: "Medicine batch No already exist.",
        });
      }
    }

    //   build update object dynamically
    const updateData: any = {};

    if (batchNo) updateData.batchNo = batchNo;
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (quantity) updateData.quantity = quantity;
    if (purchasePrice) updateData.purchasePrice = purchasePrice;

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
    //   update organizationId
    updateData.organizationId = organization._id;

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
    //   update branchId
    updateData.branchId = branch._id;

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
    //   update medicineId
    updateData.medicineId = medicine._id;

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
    //   update warehouseId
    updateData.warehouseId = warehouse._id;

    // Update inventoryBatch
    const updatedInventoryBatch = await InventoryBatch.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Inventory batch", id),
      id: updatedInventoryBatch!._id,
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

    console.error("Update inventory batch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete inventoryBatch
const deleteInventoryBatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const inventoryBatch = await InventoryBatch.findByIdAndDelete(id);

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Inventory batch", id),
      id,
    });
  } catch (error) {
    console.error("Delete inventory batch error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createInventoryBatch,
  inventoryBatchList,
  inventoryBatchInfo,
  updateInventoryBatch,
  deleteInventoryBatch,
};
