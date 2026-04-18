/* eslint-disable @typescript-eslint/no-explicit-any */
import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";
import {
  inventoryBatchSchemaValidator,
  updateInventoryBatchValidator,
} from "../validators/inventoryBatch.validator";
import { Medicine } from "../models/Medicine.model";
import InventoryBatch from "../models/InventoryBatch.model";
import mongoose from "mongoose";
import { parseMedicineInput } from "../helper/parseMedicineInput";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import Warehouse from "../models/Warehouse.model";
import { isSuperAdmin } from "../middlewares/auth.middleware";

// create inventoryBatch
const createInventoryBatch = async (req: AuthRequest, res: Response) => {
  try {
    const superAdmin = isSuperAdmin(req.user);

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
      medicineName,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseName,
    } = validationResult.data;

    const { organizationName, branchName } = req.body;

    // dynamic assign
    let organizationId = req.user!.organizationId;
    let branchId = req.user!.branchId;
    let warehouseId;

    if (superAdmin) {
      // manage organizaton
      if (!organizationName) {
        return res.status(400).json({
          success: false,
          message: "Organization name is required",
        });
      } else {
        const organization = await Organization.findOne({
          name: organizationName,
          isActive: true,
        });

        if (!organization) {
          const activeOrganization = await Organization.find({
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Organization"),
            hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
          });
        }
        organizationId = organization._id.toString();
      }

      // manage branch
      if (!branchName) {
        return res.status(400).json({
          success: false,
          message: "Branch name is required!",
        });
      } else {
        const branch = await Branch.findOne({
          name: branchName,
          organizationId,
          isActive: true,
        });

        if (!branch) {
          const activeBranch = await Branch.find({
            organizationId,
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Branch"),
            hints: `Active branch names are: ${activeBranch.map((bra) => bra.name).join(", ")}`,
          });
        }
        branchId = branch._id.toString();
      }
    }

    //   check valid medicine name
    const activeMedicine = await Medicine.find({
      organizationId,
      isActive: true,
    }).select("name");

    const medicine = await Medicine.findOne({
      name: medicineName,
      organizationId,
      isActive: true,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Invalid medicine name.",
        hints: `Active medicine names are: ${activeMedicine.map((m) => m.name).join(", ")}`,
      });
    }

    if (warehouseName) {
      const warehouse = await Warehouse.findOne({
        name: warehouseName,
        organizationId,
        branchId,
        isActive: true,
      });

      if (!warehouse) {
        const activeWarehouse = await Warehouse.find({
          organizationId,
          branchId,
          isActive: true,
        }).select("name");

        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Warehouse"),
          hints: `Active warehouse names are: ${activeWarehouse.map((wh) => wh.name).join(", ")}`,
        });
      }
      warehouseId = warehouse._id.toString();
    }

    const existingBatchNo = await InventoryBatch.findOne({
      batchNo,
      organizationId,
      branchId,
      warehouseId,
    });

    if (existingBatchNo) {
      return res.status(409).json({
        success: false,
        message: "Medicine batch No already exist.",
      });
    }

    //   create inventoryBatch
    const inventoryBatch = await InventoryBatch.create({
      organizationId,
      branchId,
      medicineId: medicine._id,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseId,
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
    const superAdmin = isSuperAdmin(req.user);

    const { status, medicineName, page, limit, batchNo } = req.query;

    const search = typeof medicineName === "string" ? medicineName : "";
    const { name, strength, unit } = parseMedicineInput(search);

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const baseFilter: any = {};

    if (!superAdmin) {
      baseFilter.organizationId = req.user!.organizationId;
      baseFilter.branchId = req.user!.branchId;
    }

    if (status) {
      baseFilter.status = { $regex: status, $options: "i" };
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

    const finalData = search
      ? inventoryBatch.filter((item) => item.medicineId)
      : inventoryBatch;

    // counts
    const total = await InventoryBatch.countDocuments({ ...baseFilter });

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
    const superAdmin = isSuperAdmin(req.user);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    const inventoryBatch = await InventoryBatch.findOne(filter).populate([
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

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
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
      medicineName,
      batchNo,
      expiryDate,
      quantity,
      purchasePrice,
      warehouseName,
    } = validationResult.data;

    const { organizationName, branchName } = req.body;

    const inventoryBatch = await InventoryBatch.findOne(filter);

    if (!inventoryBatch) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Inventory batch", id),
      });
    }

    //   build update object dynamically
    const updateData: any = {};

    // update for super admin
    if (superAdmin) {
      // manage organizaton
      if (organizationName) {
        const organization = await Organization.findOne({
          name: organizationName,
          isActive: true,
        });

        if (!organization) {
          const activeOrganization = await Organization.find({
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Organization"),
            hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
          });
        }
        updateData.organizationId = organization._id.toString();
      }

      // manage branch
      if (branchName) {
        const branch = await Branch.findOne({
          name: branchName,
          organizationId: updateData.organizationId,
          isActive: true,
        });

        if (!branch) {
          const activeBranch = await Branch.find({
            organizationId: updateData.organizationId,
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Branch"),
            hints: `Active branch names are: ${activeBranch.map((bra) => bra.name).join(", ")}`,
          });
        }
        updateData.branchId = branch._id.toString();
      }
    }

    const finalOrganizationId =
      updateData.organizationId || inventoryBatch.organizationId;

    const finalBranchId = updateData.branchId || inventoryBatch.branchId;

    if (medicineName) {
      const medicine = await Medicine.findOne({
        name: medicineName,
        organizationId: finalOrganizationId,
        isActive: true,
      });

      if (!medicine) {
        //   check valid medicine name
        const activeMedicine = await Medicine.find({
          organizationId: finalOrganizationId,
          isActive: true,
        }).select("name");

        return res.status(404).json({
          success: false,
          message: "Invalid medicine name.",
          hints: `Active medicine names are: ${activeMedicine.map((m) => m.name).join(", ")}`,
        });
      }
      //   update medicineId
      updateData.medicineId = medicine._id;
    }

    // manage branch
    if (warehouseName) {
      const warehouse = await Warehouse.findOne({
        name: warehouseName,
        organizationId: finalOrganizationId,
        branchId: finalBranchId,
        isActive: true,
      });

      if (!warehouse) {
        const activeWarehouse = await Warehouse.find({
          organizationId: finalOrganizationId,
          branchId: finalBranchId,
          isActive: true,
        }).select("name");

        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Warehouse"),
          hints: `Active warehouse names are: ${activeWarehouse.map((wh) => wh.name).join(", ")}`,
        });
      }
      updateData.warehouseId = warehouse._id.toString();
    }

    const finalWarehouseId =
      updateData.warehouseId || inventoryBatch.warehouseId;

    //   prevent duplicate batch no
    if (batchNo && batchNo !== inventoryBatch.batchNo) {
      const existingBatchNo = await InventoryBatch.findOne({
        batchNo,
        organizationId: finalOrganizationId,
        branchId: finalBranchId,
        warehouseId: finalWarehouseId,
        _id: { $ne: id }, // exclude current inventoryBatch
      });

      if (existingBatchNo) {
        return res.status(409).json({
          success: false,
          message: "Medicine batch No already exist.",
        });
      }
    }

    if (batchNo) updateData.batchNo = batchNo;
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (quantity) updateData.quantity = quantity;
    if (purchasePrice) updateData.purchasePrice = purchasePrice;

    // Update inventoryBatch
    const updatedInventoryBatch = await InventoryBatch.findByIdAndUpdate(
      filter,
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

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    const inventoryBatch = await InventoryBatch.findByIdAndDelete(filter);

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
