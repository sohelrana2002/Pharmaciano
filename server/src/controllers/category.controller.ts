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

    const { name, description, isActive } = validationResult.data;

    const existingCategory = await Category.findOne({
      name,
      organizationId: req.user!.organizationId,
    });

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
      organizationId: req.user!.organizationId,
      isActive,
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
    const { isActive, name, page, limit } = req.query;

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

    const category = await Category.find(filter)
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

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category"),
      });
    }

    const total = await Category.countDocuments({ ...baseFilter });

    const activeCount = await Category.countDocuments({
      ...baseFilter,
      isActive: true,
    });

    const inActiveCount = await Category.countDocuments({
      ...baseFilter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        category.length > 0
          ? customMessage.found("List of category")
          : "No category found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: category.length,
      },
      total,
      active: activeCount,
      inActive: inActiveCount,
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

    const category = await Category.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    }).populate([
      {
        path: "organizationId",
        select: "name contact address",
      },
      {
        path: "createdBy",
        select: "name email",
      },
    ]);

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

    const { name, description, isActive } = validationResult.data;

    const category = await Category.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category", id),
      });
    }

    // Prevent duplicate fields (industry practice)
    if (name && name !== category.name) {
      const existingName = await Category.findOne({
        name,
        organizationId: req.user!.organizationId,
      });

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
    if (isActive) updateData.isActive = isActive;

    const updateResult = await Category.findByIdAndUpdate(
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

    const category = await Category.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
    });

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
