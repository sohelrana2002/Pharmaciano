/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import { medicineSchemaValidator } from "../validators/medicine.validator";
import Medicine from "../models/Medicine.model";
import Category from "../models/Category.model";
import Brand from "../models/Brand.model";

// create medicine
const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = medicineSchemaValidator.safeParse(req.body);

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
      name,
      genericName,
      categoryName,
      brandName,
      dosageForm,
      strength,
      unit,
      unitPrice,
      unitsPerStrip,
      isPrescriptionRequired,
      taxRate,
    } = validationResult.data;

    //   check valid category
    const activeCategory = await Category.find({
      isActive: true,
    }).select("name");

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Invalid category name.",
        hints: `Active category names are ${activeCategory.map((c) => c.name).join(", ")}`,
      });
    }

    //   check valid brand
    const activeBrand = await Brand.find({
      isActive: true,
    }).select("name");

    const brand = await Brand.findOne({ name: brandName });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Invalid brand name.",
        hints: `Active brand names are ${activeBrand.map((b) => b.name).join(", ")}`,
      });
    }

    const existingMedicine = await Medicine.findOne({
      genericName,
      strength,
      dosageForm,
      brand: brand._id,
    });

    if (existingMedicine) {
      return res.status(409).json({
        succes: false,
        message:
          "Medicine already exists with the same generic name, strength, dosage form, and brand",
      });
    }

    const medicine = await Medicine.create({
      name,
      genericName,
      dosageForm,
      strength,
      unit,
      isPrescriptionRequired,
      taxRate,
      category: category._id,
      brand: brand._id,
      createdBy: req.user!.userId,
      unitPrice,
      unitsPerStrip,
      stripPrice: unitPrice * unitsPerStrip,
    });

    //   success response
    return res.status(201).json({
      success: true,
      message: "Medicine created successfully!",
      id: medicine._id,
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

    console.error("Create medicine error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { createMedicine };
