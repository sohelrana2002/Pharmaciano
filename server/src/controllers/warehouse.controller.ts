/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import { customMessage } from "../constants/customMessage";
import {
  updateWarehouseValidator,
  warehousSchemaValidator,
} from "../validators/warehouse.validator";
import Warehouse from "../models/Warehouse.model";
import Branch from "../models/Branch.model";
import mongoose from "mongoose";
import Role from "../models/Role.model";
import User from "../models/User.model";

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
    const existingWarehouse = await Warehouse.findOne({
      name,
      organizationId: req.user!.organizationId,
    });

    if (existingWarehouse) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Warehouse"),
      });
    }

    //   fetch all active branch
    const activeBranch = await Branch.find({
      isActive: true,
      organizationId: req.user!.organizationId,
    }).select("name");

    //   find branch name, exist or not
    const branch = await Branch.findOne({
      name: branchName,
      organizationId: req.user!.organizationId,
    });

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
      isActive,
      organizationId: req.user!.organizationId,
      branchId: branch._id,
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

// list of Warehouse
const warehouseList = async (req: AuthRequest, res: Response) => {
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

    const warehouse = await Warehouse.find(filter)
      .populate([
        {
          path: "organizationId",
          select: "name -_id",
        },
        {
          path: "branchId",
          select: "name -_id",
        },
        {
          path: "createdBy",
          select: "name email -_id",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Warehouse"),
      });
    }

    const total = await Warehouse.countDocuments({ ...baseFilter });

    const activeCount = await Warehouse.countDocuments({
      ...baseFilter,
      isActive: true,
    });

    const inActiveCount = await Warehouse.countDocuments({
      ...baseFilter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        warehouse.length > 0
          ? customMessage.found("Warehouse")
          : "No warehouse found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: warehouse.length,
      },

      total,
      active: activeCount,
      inActive: inActiveCount,
      data: { warehouse },
    });
  } catch (error: any) {
    console.error("list of  warehouse error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// warehouse info
const warehouseInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const warehouse = await Warehouse.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    }).populate([
      {
        path: "organizationId",
        select: "name address contact -_id",
      },
      {
        path: "branchId",
        select: "name address contact -_id",
      },
      {
        path: "createdBy",
        select: "name email phone -_id",
      },
    ]);

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Warehouse", id),
      });
    }

    const role = await Role.findOne({ name: "STAFF" });

    const staffList = await User.find({
      roleId: role?._id,
      warehouseId: warehouse?._id,
    }).select("name email phone -_id");

    return res.status(200).json({
      success: true,
      message: customMessage.found("Warehouse", id),
      data: { warehouse },
      staffList: staffList.length > 0 ? staffList : "No staff found!",
    });
  } catch (error: any) {
    console.error("warehouse info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update warehouse
const updateWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const validationResult = updateWarehouseValidator.safeParse(req.body);

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

    const warehouse = await Warehouse.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Warehouse", id),
      });
    }

    if (name && name !== warehouse.name) {
      const existing = await Warehouse.findOne({
        name,
        organizationId: req.user!.organizationId,
      });

      if (existing) {
        return res.status(404).json({
          success: false,
          message: customMessage.alreadyExists("Warehouse name"),
        });
      }
    }

    // build update data dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (capacity) updateData.capacity = capacity;
    if (isActive) updateData.isActive = isActive;

    //   fetch all active branch
    const activeBranch = await Branch.find({
      isActive: true,
      organizationId: req.user!.organizationId,
    }).select("name");

    //   find branch name, exist or not
    const branch = await Branch.findOne({
      name: branchName,
      organizationId: req.user!.organizationId,
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch name.",
        hint: `Available branch name are ${activeBranch
          .map((branch) => branch.name)
          .join(", ")}`,
      });
    }

    updateData.branchId = branch._id;

    const updateResult = await Warehouse.findByIdAndUpdate(
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
      message: customMessage.updated("Warehouse", id),
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

    console.error("update warehouse error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete warehouse
const deleteWarehouse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const warehouse = await Warehouse.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Warehouse", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Warehouse", id),
      id,
    });
  } catch (error: any) {
    console.error("delete warehouse error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createWarehouse,
  warehouseList,
  warehouseInfo,
  updateWarehouse,
  deleteWarehouse,
};
