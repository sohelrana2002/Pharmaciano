/* eslint-disable @typescript-eslint/no-explicit-any */
import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";
import {
  inventoryBatchSchemaValidator,
  updateInventoryBatchValidator,
} from "../validators/inventoryBatch.validator";
import Medicine from "../models/Medicine.model";
import InventoryBatch from "../models/InventoryBatch.model";
import mongoose from "mongoose";
import { parseMedicineInput } from "../helper/parseMedicineInput";

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

    const { medicineName, batchNo, expiryDate, quantity, purchasePrice } =
      validationResult.data;

    //   check valid medicine name
    const activeMedicine = await Medicine.find({
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const medicine = await Medicine.findOne({
      name: medicineName,
      organizationId: req.user!.organizationId,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Invalid medicine name.",
        hints: `Active medicine names are: ${activeMedicine.map((m) => m.name).join(", ")}`,
      });
    }

    const existingBatchNo = await InventoryBatch.findOne({
      batchNo,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    if (existingBatchNo) {
      return res.status(409).json({
        success: false,
        message: "Medicine batch No already exist.",
      });
    }

    //   create inventoryBatch
    const inventoryBatch = await InventoryBatch.create({
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      medicineId: medicine._id,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseId: req.user!.warehouseId,
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
    const { status, medicineName, page, limit, batchNo } = req.query;

    const search = typeof medicineName === "string" ? medicineName : "";
    const { name, strength, unit } = parseMedicineInput(search);

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const baseFilter: any = {
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    };

    if (status) {
      baseFilter.status = status;
    }
    if (batchNo) {
      baseFilter.batchNo = { $regex: batchNo, $options: "i" };
    }

    // conditionally add match
    const medicinePopulate: any = {
      path: "medicineId",
      select: "name strength unit",
    };

    if (search) {
      medicinePopulate.match = {
        ...(name && { name: { $regex: name, $options: "i" } }),
        ...(strength && { strength }),
        ...(unit && { unit: new RegExp(`^${unit}$`, "i") }),
      };
    }

    const inventoryBatch = await InventoryBatch.find(baseFilter)
      .populate(medicinePopulate)
      .populate([
        { path: "organizationId", select: "name" },
        { path: "branchId", select: "name" },
        { path: "warehouseId", select: "name" },
      ])
      .select("-createdBy")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    console.log(
      "filter: ",
      inventoryBatch.filter((item) => item.medicineId),
    );

    const finalData = search
      ? inventoryBatch.filter((item) => item.medicineId)
      : inventoryBatch;

    // counts
    const total = await InventoryBatch.countDocuments({
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    const activeCount = await InventoryBatch.countDocuments({
      ...baseFilter,
      status: "active",
    });

    const expiredCount = await InventoryBatch.countDocuments({
      ...baseFilter,
      status: "expired",
    });

    return res.status(200).json({
      success: true,
      message:
        finalData.length > 0
          ? customMessage.found("Inventory batch")
          : "No inventory batches found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: finalData.length,
      },
      total,
      active: activeCount,
      expired: expiredCount,
      data: finalData,
    });
  } catch (error) {
    console.error("List of inventory batch error:", error);

    return res.status(500).json({
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

    const inventoryBatch = await InventoryBatch.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    }).populate([
      {
        path: "organizationId",
        select: "name contact address",
      },
      {
        path: "branchId",
        select: "name contact address",
      },
      {
        path: "medicineId",
        select: "-brandId -categoryId -createdBy",
      },
      {
        path: "warehouseId",
        select: "name location",
      },
      {
        path: "createdBy",
        select: "name email",
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
      data: { inventoryBatch },
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

    const { medicineName, batchNo, expiryDate, quantity, purchasePrice } =
      validationResult.data;

    const inventoryBatch = await InventoryBatch.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch", id),
      });
    }

    //   prevent duplicate batch no
    if (batchNo && batchNo !== inventoryBatch.batchNo) {
      const existingBatchNo = await InventoryBatch.findOne({
        batchNo,
        organizationId: req.user!.organizationId,
        branchId: req.user!.branchId,
        warehouseId: req.user!.warehouseId,
        _id: { $ne: id }, // exclude current inventoryBatch
      });

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

    //   check valid medicine name
    const activeMedicine = await Medicine.find({
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const medicine = await Medicine.findOne({
      name: medicineName,
      organizationId: req.user!.organizationId,
      isActive: true,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Invalid medicine name.",
        hints: `Active medicine names are ${activeMedicine.map((m) => m.name).join(", ")}`,
      });
    }
    //   update medicineId
    updateData.medicineId = medicine._id;

    // Update inventoryBatch
    const updatedInventoryBatch = await InventoryBatch.findByIdAndUpdate(
      {
        _id: id,
        organizationId: req.user!.organizationId,
        branchId: req.user!.branchId,
        warehouseId: req.user!.warehouseId,
      },
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

    const inventoryBatch = await InventoryBatch.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

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
