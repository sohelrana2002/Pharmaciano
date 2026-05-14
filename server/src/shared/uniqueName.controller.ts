import { AuthRequest } from "../types";
import { Response } from "express";
import { customMessage } from "../constants/customMessage";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import Role from "../models/Role.model";
import Warehouse from "../models/Warehouse.model";

export const uniqueNameList = async (req: AuthRequest, res: Response) => {
  try {
    const organizationName = await Organization.aggregate([
      { $group: { _id: "$name", firstId: { $first: "$_id" } } },
      { $project: { _id: "$firstId", name: "$_id" } },
    ]);

    if (!organizationName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Organization name"),
      });
    }

    const branchName = await Branch.aggregate([
      { $group: { _id: "$name", firstId: { $first: "$_id" } } },
      { $project: { _id: "$firstId", name: "$_id" } },
    ]);

    if (!branchName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Branch name"),
      });
    }

    const roleName = await Role.aggregate([
      { $group: { _id: "$name", firstId: { $first: "$_id" } } },
      { $project: { _id: "$firstId", name: "$_id" } },
    ]);

    if (!roleName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Role name"),
      });
    }

    const warehouseName = await Warehouse.aggregate([
      { $group: { _id: "$name", firstId: { $first: "$_id" } } },
      { $project: { _id: "$firstId", name: "$_id" } },
    ]);

    if (!warehouseName) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Warehouse name"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Unique name"),
      data: {
        organizationName,
        branchName,
        roleName,
        warehouseName,
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
