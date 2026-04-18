import { AuthRequest } from "../types";
import { Response } from "express";
import { customMessage } from "../constants/customMessage";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import Role from "../models/Role.model";
import { Medicine } from "../models/Medicine.model";
import Category from "../models/Category.model";
import Brand from "../models/Brand.model";
import InventoryBatch from "../models/InventoryBatch.model";

export const uniqueNameList = async (req: AuthRequest, res: Response) => {
  try {
    const organizationName = await Organization.distinct("name");

    if (!organizationName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization name"),
      });
    }

    const branchName = await Branch.distinct("name");

    if (!branchName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Branch name"),
      });
    }

    const roleName = await Role.distinct("name");

    if (!roleName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Role name"),
      });
    }

    const medicineName = await Medicine.distinct("name");

    if (!medicineName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Medicine name"),
      });
    }

    const brandName = await Brand.distinct("name");

    if (!brandName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Brand name"),
      });
    }

    const categoryName = await Category.distinct("name");

    if (!categoryName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Category name"),
      });
    }

    const batchNo = await InventoryBatch.distinct("batchNo");

    if (!batchNo) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("InventoryBatch name"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Unique name"),
      data: {
        organizationName,
        branchName,
        roleName,
        medicineName,
        categoryName,
        brandName,
        batchNo,
      },
    });
  } catch (error) {
    console.error("Unique name list error: ", error);

    return res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};
