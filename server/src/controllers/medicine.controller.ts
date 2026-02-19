/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import {
  medicineSchemaValidator,
  updateMedicineValidator,
} from "../validators/medicine.validator";
import Medicine from "../models/Medicine.model";
import Category from "../models/Category.model";
import Brand from "../models/Brand.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

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
      isActive,
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
      brandId: brand._id,
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
      categoryId: category._id,
      brandId: brand._id,
      createdBy: req.user!.userId,
      unitPrice,
      unitsPerStrip,
      stripPrice: unitPrice * unitsPerStrip,
      isActive,
    });

    //   success response
    return res.status(201).json({
      success: true,
      message: customMessage.created("Medicine"),
      id: medicine._id,
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

    console.error("Create medicine error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of medicine
const medicineList = async (req: AuthRequest, res: Response) => {
  try {
    const medicine = await Medicine.find({ isActive: true }).select(
      "-categoryId -brandId -createdBy",
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("List of medicine"),
      length: medicine.length,
      data: { medicine },
    });
  } catch (error) {
    console.error("List of medicine error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual medicine info
const medicineInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const medicine = await Medicine.findById(id).populate([
      {
        path: "categoryId",
        select: "name description -_id",
      },
      {
        path: "brandId",
        select: "name manufacturer country -_id",
      },
      {
        path: "createdBy",
        select: "name email -_id",
      },
    ]);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Individual medicine info"),
      data: { medicine },
    });
  } catch (error) {
    console.error("Individual medicine info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update medicine
const updateMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    // Validate request body using Zod
    const validationResult = updateMedicineValidator.safeParse(req.body);

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
      isActive,
    } = validationResult.data;

    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine", id),
      });
    }

    // revent duplicate medicine name (industry practice)
    if (name && name !== medicine.name) {
      const existingMedicine = await Medicine.findOne({ name });

      if (existingMedicine) {
        return res.status(409).json({
          success: false,
          message: "Medicine name already exists.",
        });
      }
    }

    //Build update object dynamically
    const updateData: any = {};

    if (name) updateData.name = name;
    if (genericName) updateData.genericName = genericName;
    if (dosageForm) updateData.dosageForm = dosageForm;
    if (strength) updateData.strength = strength;
    if (unit) updateData.unit = unit;
    if (unitPrice !== undefined) updateData.unitPrice = unitPrice;
    if (unitsPerStrip !== undefined) updateData.unitsPerStrip = unitsPerStrip;
    if (isPrescriptionRequired !== undefined)
      updateData.isPrescriptionRequired = isPrescriptionRequired;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (unitPrice && unitsPerStrip) {
      updateData.stripPrice = unitPrice * unitsPerStrip;
    }

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

    // valid category name update
    updateData.categoryId = category._id;

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

    // valid brand name
    updateData.brandId = brand._id;

    // Update medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Medicine", id),
      id: updatedMedicine!._id,
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

    console.error("Update medicine error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete medicine
const deleteMedicine = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const medicine = await Medicine.findByIdAndUpdate(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Medicine", id),
      id,
    });
  } catch (error) {
    console.error("Delete medicine error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createMedicine,
  medicineList,
  medicineInfo,
  updateMedicine,
  deleteMedicine,
};
