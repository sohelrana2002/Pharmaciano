/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRequest } from "../types";
import { Response } from "express";
import Brand from "../models/Brand.model";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Organization from "../models/Organization.model";

// create brand
const createBrand = async (req: AuthRequest, res: Response) => {
  try {
    const superAdmin = isSuperAdmin(req.user);

    const { name, manufacturer, country, isActive, organizationName } =
      req.validatedData;

    let organizationId = req.user?.organizationId;

    if (superAdmin) {
      // manage organizaton
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

    const existingBrand = await Brand.findOne({
      name,
      organizationId,
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
      organizationId,
      isActive,
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
    const { isActive, search, page, limit } = req.query;

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = {};

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { manufacturer: { $regex: search, $options: "i" } },
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const brands = await Brand.find(filter)
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

    if (!brands) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brands"),
      });
    }

    const total = await Brand.countDocuments({ ...filter });

    const activeCount = await Brand.countDocuments({
      ...filter,
      isActive: true,
    });

    const inActiveCount = await Brand.countDocuments({
      ...filter,
      isActive: false,
    });

    return res.status(200).json({
      success: true,
      message:
        brands.length > 0
          ? customMessage.found("List of brands")
          : "No brand found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: brands.length,
      },
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

    const superAdmin = isSuperAdmin(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    const brand = await Brand.findOne(filter).populate([
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "createdBy",
        select: "name email -_id",
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

    const superAdmin = isSuperAdmin(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    const { name, manufacturer, country, isActive, organizationName } =
      req.validatedData;

    const brand = await Brand.findOne(filter);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brand", id),
      });
    }

    //   build update object dynamically
    const updateData: any = {};

    if (superAdmin) {
      // manage organizaton
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

    const finalOrganizationId =
      updateData.organizationId || brand.organizationId;

    // prevent duplicate brand name
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({
        name,
        organizationId: finalOrganizationId,
      });

      if (existingBrand) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("Brand name"),
        });
      }
    }

    if (name) updateData.name = name;
    if (manufacturer) updateData.manufacturer = manufacturer;
    if (country) updateData.country = country;
    if (isActive) updateData.isActive = isActive;

    // update brand
    const updateResult = await Brand.findByIdAndUpdate(filter, updateData, {
      new: true,
    });

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

    const superAdmin = isSuperAdmin(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
    }

    const deletedBrand = await Brand.findByIdAndDelete(filter);

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
