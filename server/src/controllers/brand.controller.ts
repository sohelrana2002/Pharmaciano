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

    const existingBrand = await Brand.findOne({ name });

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
          reason: `${field} already exists`,
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
    const brands = await Brand.find({ isActive: true })
      .select("-createdBy")
      .sort({ name: 1 });

    if (!brands) {
      return res.status(404).json({
        success: false,
        message: "Brands not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "List of brands.",
      length: brands.length,
      data: { brands },
    });
  } catch (error) {
    console.error("List of brand error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "Invalid brand ID.",
      });
    }

    const brand = await Brand.findOne({ _id: id }).populate({
      path: "createdBy",
      select: "name email -_id",
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand individul info",
      data: { brand },
    });
  } catch (error) {
    console.error("Individual brand info error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "Invalid brand ID.",
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

    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    // prevent duplicate brand name
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({ name });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: "Brand name already exist.",
        });
      }
    }

    const updateData: any = {};

    if (name) updateData.name = name;
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (country) updateData.country = country;

    // update brand
    const updateResult = await Brand.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: "Brand update successfully.",
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
    console.error("Update brand error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "Invalid brand ID.",
      });
    }

    const deletedBrand = await Brand.findByIdAndDelete(id);

    if (!deletedBrand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("Delete brand error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { createBrand, brandList, brandInfo, updateBrand, deleteBrand };
