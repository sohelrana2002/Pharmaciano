/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import Brand from "../models/Brand.model";
import {
  brandSchemaValidator,
  updateBrandValidator,
} from "../validators/brand.validator";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

// create brand
const createBrand = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = brandSchemaValidator.safeParse(req.body);

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

    const { name, manufacturer, country } = validationResult.data;

    const existingBrand = await Brand.findOne({
      name,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
      isActive: true,
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Brand"),
      });
    }

    const brand = await Brand.create({
      name,
      manufacturer,
      country,
      createdBy: req.user!.userId,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Brand"),
      id: brand._id,
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
    console.error("Create brand error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of brand
const brandList = async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.query;

    const baseFilter: any = {
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    };

    const filter: any = { ...baseFilter };

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const brands = await Brand.find(filter)
      .populate([
        {
          path: "organizationId",
          select: "name",
        },
        {
          path: "branchId",
          select: "name",
        },
        {
          path: "warehouseId",
          select: "name",
        },
        {
          path: "createdBy",
          select: "name email",
        },
      ])
      .sort({ name: 1 });

    if (!brands) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brands"),
      });
    }

    const total = await Brand.countDocuments({ ...baseFilter });

    const activeCount = await Brand.countDocuments({
      ...baseFilter,
      isActive: true,
    });

    const inActiveCount = await Brand.countDocuments({
      ...baseFilter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        brands.length > 0
          ? customMessage.found("List of brands")
          : "No Medicinees found!",
      total,
      active: activeCount,
      inActive: inActiveCount,
      data: { brands },
    });
  } catch (error) {
    console.error("List of brand error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual brand info
const brandInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const brand = await Brand.findOne({
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
        path: "warehouseId",
        select: "name location",
      },
      {
        path: "createdBy",
        select: "name email",
      },
    ]);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brand", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Individul Brand info"),
      data: { brand },
    });
  } catch (error) {
    console.error("Individual brand info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update brand
const updateBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }
    // Validate request body using Zod
    const validationResult = updateBrandValidator.safeParse(req.body);

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

    const { name, manufacturer, country } = validationResult.data;

    const brand = await Brand.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brand", id),
      });
    }

    // prevent duplicate brand name
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({
        name,
        organizationId: req.user!.organizationId,
        branchId: req.user!.branchId,
        warehouseId: req.user!.warehouseId,
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("Brand name"),
        });
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (country) updateData.country = country;

    // update brand
    const updateResult = await Brand.findByIdAndUpdate(
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
      message: customMessage.updated("Brand", id),
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
    console.error("Update brand error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete brand
const deleteBrand = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const deletedBrand = await Brand.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      warehouseId: req.user!.warehouseId,
    });

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brand", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Brand", id),
      id,
    });
  } catch (error) {
    console.error("Delete brand error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createBrand, brandList, brandInfo, updateBrand, deleteBrand };
