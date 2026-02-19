/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import Role from "../models/Role.model";
import Feature from "../models/Feature.model";
import { AuthRequest } from "../types";
import {
  roleSchemaValidator,
  updateRoleValidator,
} from "../validators/role.validator";
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";

// create role
const createRole = async (req: AuthRequest, res: Response) => {
  try {
    // Validate request body using Zod
    const validationResult = roleSchemaValidator.safeParse(req.body);

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
    const { name, description, permissions } = validationResult.data;

    // Check if role already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role with this name already exists.",
      });
    }

    // Fetch all ACTIVE features
    const activeFeatures = await Feature.find({ isActive: true }).select(
      "name",
    );

    // Extract active feature names
    const activeFeatureNames = activeFeatures.map((f) => f.name);

    // Find invalid permissions provided by client
    const invalidPermissions = permissions.filter(
      (permission) => !activeFeatureNames.includes(permission),
    );

    // If invalid features exist, return error with suggestions
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some provided permissions are invalid or inactive.",
        invalidPermissions,
        availablePermissions: activeFeatureNames,
      });
    }

    // Create the role
    const role = new Role({
      name,
      description,
      permissions,
      createdBy: req.user!.userId,
    });

    await role.save();

    // Populate the createdBy field for response
    const savedRole = await Role.findById(role._id).populate(
      "createdBy",
      "name email",
    );

    res.status(201).json({
      success: true,
      message: customMessage.created("Role"),
      id: savedRole!._id,
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
    console.error("Create role error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of role
const roleList = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await Role.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    if (!roles) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Role"),
      });
    }

    res.json({
      success: true,
      message: customMessage.found("List of role"),
      data: { roles },
    });
  } catch (error) {
    console.error("List of role error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update role
const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", roleId),
      });
    }

    // Validate request body using Zod
    const validationResult = updateRoleValidator.safeParse(req.body);

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

    const { name, description, permissions } = validationResult.data;

    // check role exist
    const role = await Role.findOne({ _id: roleId });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Role"),
      });
    }

    // prevent duplicate role name
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ name });

      if (existingRole) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("Role name"),
        });
      }
    }

    // validate features
    if (permissions) {
      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: "Permissions must be an array.",
        });
      }
    }

    // ensure features exist in DB
    const validFeatures = await Feature.find({
      name: { $in: permissions },
    }).select("name");
    // console.log("validFeatures", validFeatures);

    const validFeatureNames = validFeatures.map((f) => f.name);

    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(
        (p) => !validFeatureNames.includes(p),
      );

      if (invalidPermissions.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid permissions provided",
          invalidPermissions,
        });
      }
    }

    // build update object
    const updateData: any = {};

    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (permissions) updateData.permissions = permissions;

    // update role
    const updateResult = await Role.findByIdAndUpdate(roleId, updateData, {
      new: true,
    });

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Role", roleId),
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
    console.error("Update role error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete role
const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const deletedRole = await Role.findByIdAndDelete(id);
    // console.log("deletedRole", deletedRole);

    if (!deletedRole) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Role", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Role", id),
      id,
    });
  } catch (error) {
    console.error("Delete role error: ", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// get all feature
const getFeatures = async (req: AuthRequest, res: Response) => {
  try {
    const features = await Feature.find({ isActive: true }).sort({
      category: 1,
      name: 1,
    });

    if (!features) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Feature"),
      });
    }

    res.json({
      success: true,
      message: customMessage.found("Features"),
      data: { features },
    });
  } catch (error) {
    console.error("Get features error:", error);
    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createRole, roleList, getFeatures, updateRole, deleteRole };
