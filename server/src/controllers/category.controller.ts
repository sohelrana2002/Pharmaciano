/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import {
  categorySchemaValidator,
  updateCategoryValidator,
} from "../validators/category.validator";
import Category from "../models/Category.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

// create category
const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = categorySchemaValidator.safeParse(req.body);

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

    const { name, description } = validationResult.data;

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Category"),
      });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Category"),
      id: category._id,
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
    console.error("Create categories error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of category
const categoryList = async (req: AuthRequest, res: Response) => {
  try {
    const category = await Category.find({ isActive: true }).select(
      "-createdBy",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("List of category"),
      length: category.length,
      data: { category },
    });
  } catch (error: any) {
    console.error("List of categories error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual category info
const categoryInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const category = await Category.findById(id).populate(
      "createdBy",
      "name email -_id",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Individual category info"),
      data: { category },
    });
  } catch (error: any) {
    console.error("Individual categories info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// category update
const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const validationResult = updateCategoryValidator.safeParse(req.body);

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

    const { name, description } = validationResult.data;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category", id),
      });
    }

    // Prevent duplicate fields (industry practice)
    if (name && name !== category.name) {
      const existingName = await Category.findOne({ name });

      if (existingName) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("Category name"),
        });
      }
    }

    // Build update data dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;

    const updateResult = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Category", id),
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
    console.error("update categories error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete category
const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Category", id),
      id,
    });
  } catch (error) {
    console.error("Delete categories error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createCategory,
  categoryList,
  categoryInfo,
  updateCategory,
  deleteCategory,
};
