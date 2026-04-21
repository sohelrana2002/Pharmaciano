/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import { randomUUID } from "crypto";
import { Medicine } from "../models/Medicine.model";
import Category from "../models/Category.model";
import Brand from "../models/Brand.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { parseMedicineInput } from "../helper/parseMedicineInput";
import { isSuperAdmin } from "../middlewares/auth.middleware";

// create medicine
const createMedicine = async (req: AuthRequest, res: Response) => {
  try {
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
    } = req.validatedData;

    //   check valid category
    const activeCategory = await Category.find({
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const category = await Category.findOne({
      name: categoryName,
      organizationId: req.user!.organizationId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Invalid category name.",
        hints: `Active category names are: ${activeCategory.map((c) => c.name).join(", ")}`,
      });
    }

    //   check valid brand
    const activeBrand = await Brand.find({
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const brand = await Brand.findOne({
      name: brandName,
      organizationId: req.user!.organizationId,
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Invalid brand name.",
        hints: `Active brand names are: ${activeBrand.map((b) => b.name).join(", ")}`,
      });
    }

    const existingMedicine = await Medicine.findOne({
      name,
      genericName,
      strength,
      dosageForm,
      brandId: brand._id,
      organizationId: req.user!.organizationId,
    });

    if (existingMedicine) {
      return res.status(409).json({
        succes: false,
        message:
          "Medicine already exists with the same name, generic name, strength, dosage form, and brand",
      });
    }

    // create barcode
    const barcode = `MED-${randomUUID().slice(0, 8).toUpperCase()}`;

    // create search text
    const searchText = `${name} ${strength}${unit}`;

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
      organizationId: req.user!.organizationId,
      barcode,
      searchText,
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
    const { search, isActive, page, limit } = req.query;

    const searchString = typeof search === "string" ? search : "";

    const { name, strength, unit } = parseMedicineInput(searchString);

    const baseFilter: any = {
      organizationId: req.user!.organizationId,
    };

    // Build an array of conditions for $or
    const orConditions: any[] = [];

    // Barcode search exact match
    if (searchString) {
      orConditions.push({ barcode: searchString });
    }

    // 2. Medicine name + strength + unit search
    if (name) {
      const nameFilter = { name: { $regex: name, $options: "i" } };

      if (strength && unit) {
        // When strength and unit are provided, combine them
        orConditions.push({
          $and: [
            nameFilter,
            { strength: strength },
            { unit: new RegExp(`^${unit}$`, "i") },
          ],
        });
      } else if (name) {
        // search by name only
        orConditions.push(nameFilter);
      }
    }

    const filter: any = { ...baseFilter };

    if (orConditions.length > 0) {
      filter.$or = orConditions;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 20;
    const skip = (pageNumber - 1) * limitNumber;

    const medicine = await Medicine.find(filter)
      .populate([
        {
          path: "organizationId",
          select: "name -_id",
        },
        {
          path: "categoryId",
          select: "name -_id",
        },
        {
          path: "brandId",
          select: "name -_id",
        },
        {
          path: "createdBy",
          select: "name -_id",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine"),
      });
    }

    const total = await Medicine.countDocuments({ ...baseFilter });

    const activeCount = await Medicine.countDocuments({
      ...baseFilter,
      isActive: true,
    });

    const inActiveCount = await Medicine.countDocuments({
      ...baseFilter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        medicine.length > 0
          ? customMessage.found("List of medicine")
          : "No Medicinees found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: medicine.length,
      },
      total,
      active: activeCount,
      inActive: inActiveCount,
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

    const superAdmin = isSuperAdmin(req.user);

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

    const medicine = await Medicine.findOne(filter).populate([
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
      {
        path: "organizationId",
        select: "name contact address -_id",
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
    } = req.validatedData;

    const medicine = await Medicine.findOne({
      _id: id,
      organizationId: req.user!.organizationId,
    });

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine", id),
      });
    }

    // prevent duplicate medicine name (industry practice)
    if (name && name !== medicine.name) {
      const existingMedicine = await Medicine.findOne({
        name,
        organizationId: req.user!.organizationId,
        _id: { $ne: id }, // exclude current medicine
      });

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

    const finalName = updateData.name || medicine.name;
    const finalStrength = updateData.strength || medicine.strength;
    const finalUnit = updateData.unit || medicine.unit;

    updateData.searchText = `${finalName} ${finalStrength}${finalUnit}`;

    //   check valid category
    const activeCategory = await Category.find({
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const category = await Category.findOne({
      name: categoryName,
      organizationId: req.user!.organizationId,
      isActive: true,
    });

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
      organizationId: req.user!.organizationId,
      isActive: true,
    }).select("name");

    const brand = await Brand.findOne({
      name: brandName,
      organizationId: req.user!.organizationId,
      isActive: true,
    });

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
    const updatedMedicine = await Medicine.findByIdAndUpdate(
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

    const medicine = await Medicine.findByIdAndDelete({
      _id: id,
      organizationId: req.user!.organizationId,
    });

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
