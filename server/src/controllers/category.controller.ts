/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import { categorySchemaValidator } from "../validators/category.validator";
import Category from "../models/Category.model";

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
        message: "Category already exist!",
      });
    }

    const category = await Category.create({
      name,
      description,
      createdBy: req.user!.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully!",
      id: category._id,
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
    console.error("Create categories error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { createCategory };
