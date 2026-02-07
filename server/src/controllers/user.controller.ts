/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/User.model";
import Role from "../models/Role.model";
import { AuthRequest } from "../types";
import {
  createUserValidator,
  updateUserValidator,
} from "../validators/auth.validator";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";
import { config } from "../config/config";
import Warehouse from "../models/Warehouse.model";
import { customMessage } from "../constants/customMessage";

// create user
const createUser = async (req: AuthRequest, res: Response) => {
  try {
    // // Validate request body using Zod
    const validationResult = createUserValidator.safeParse(req.body);
    // console.log("req.user", req.user);

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
      email,
      password,
      name,
      role: roleName,
      orgName,
      branchName,
      isActive,
      phone,
      warehouseName,
    } = validationResult.data;
    // const { email, password, name, role: roleName }: CreateUserRequest = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // fetch active organization
    const activeOrganization = await Organization.find({
      isActive: true,
    }).select("name");

    const organization = await Organization.findOne({ name: orgName });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid organization name",
        hint: `Available organization names are ${activeOrganization
          .map((org) => org.name)
          .join(", ")}`,
      });
    }

    // fetch active branch
    const activeBranch = await Branch.find({ isActive: true }).select("name");

    const branch = await Branch.findOne({ name: branchName });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch name.",
        hint: `Available branch names are ${activeBranch
          .map((branch) => branch.name)
          .join(", ")}`,
      });
    }

    //  if warehouse name provide then
    let warehouse;
    if (warehouseName) {
      // fetch active warehouse
      const activeWarehouse = await Warehouse.find({ isActive: true }).select(
        "name",
      );

      warehouse = await Warehouse.findOne({ name: warehouseName });

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Invalid warehouse name.",
          hint: `Available warehouse name are ${activeWarehouse
            .map((warehouse) => warehouse.name)
            .join(", ")}`,
        });
      }
    }

    // Find role by name instead of ID
    const role = await Role.findOne({ name: roleName, isActive: true });

    // console.log("role", role);

    if (!role) {
      // Get available roles for better error message
      const availableRoles = await Role.find({ isActive: true }).select("name");
      // console.log("availableRoles", availableRoles);

      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Available roles: ${availableRoles
          .map((r) => r.name)
          .join(", ")}`,
      });
    }

    const user = new User({
      email,
      password,
      name,
      role: role._id,
      organization: organization._id,
      branch: branch._id,
      createdBy: req.user!.userId,
      phone,
      warehouse: warehouse ? warehouse._id : null,
      isActive,
    });

    await user.save();

    const savedUser = await User.findById(user._id)
      .populate<{ role: any }>("role", "name description permissions")
      .select("-password");

    // console.log("savedUser", savedUser);

    res.status(201).json({
      success: true,
      message: customMessage.created("User"),
      data: {
        user: {
          id: savedUser!._id.toString(),
          name: savedUser!.name,
          role: savedUser!.role.name,
        },
      },
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

    console.error("Create user error:", error.message);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of users
const userList = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ email: { $ne: config.superAdminEmail } })
      .populate([
        {
          path: "role",
          select: "name permissions -_id",
        },
        {
          path: "createdBy",
          select: "name -_id",
        },
        {
          path: "organization",
          select: "name address -_id",
        },
        {
          path: "branch",
          select: "name address -_id",
        },
      ])
      .select("-password -warehouse")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: customMessage.found("User profile"),
      length: users.length,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// user profile data
const userProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const profile = await User.findOne({ _id: userId })
      .populate([
        {
          path: "role",
          select: "name description permissions -_id",
        },
        {
          path: "createdBy",
          select: "name email -_id",
        },
        {
          path: "organization",
          select: "name address contact -_id",
        },
        {
          path: "branch",
          select: "name contact address -_id",
        },
        {
          path: "warehouse",
          select: "name location capacity -_id",
        },
      ])
      .select("-password");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("User profile"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("User profile"),
      data: { profile },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update user info only super admin
const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: customMessage.invalidId("mongoose", userId),
      });
    }

    // Validate request body using Zod
    const validationResult = updateUserValidator.safeParse(req.body);

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
      email,
      password,
      name,
      role: roleName,
      orgName,
      branchName,
      isActive,
      phone,
      warehouseName,
    } = validationResult.data;

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("User", userId),
      });
    }

    // Prevent duplicate fields (industry practice)
    if (email && email != existingUser.email) {
      const existing = await User.findOne({ email });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: customMessage.alreadyExists("User email"),
        });
      }
    }

    //Build update object
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;
    if (phone) updateData.phone = phone;
    if (typeof isActive !== "undefined") updateData.isActive = isActive;

    // fetch active organization
    const activeOrganization = await Organization.find({
      isActive: true,
    }).select("name");

    const organization = await Organization.findOne({ name: orgName });

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Invalid organization name",
        hint: `Available organization names are ${activeOrganization.map((org) => org.name)}`,
      });
    }
    updateData.organization = organization._id;

    // fetch active branch
    const activeBranch = await Branch.find({ isActive: true }).select("name");

    const branch = await Branch.findOne({ name: branchName });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Invalid branch name.",
        hint: `Available branch names are ${activeBranch.map((branch) => branch.name)}`,
      });
    }
    updateData.branch = branch._id;

    //  if warehouse name provide then
    let warehouse;
    if (warehouseName) {
      // fetch active warehouse
      const activeWarehouse = await Warehouse.find({ isActive: true }).select(
        "name",
      );

      warehouse = await Warehouse.findOne({ name: warehouseName });

      if (!warehouse) {
        return res.status(404).json({
          success: false,
          message: "Invalid warehouse name.",
          hint: `Available warehouse name are ${activeWarehouse
            .map((warehouse) => warehouse.name)
            .join(", ")}`,
        });
      }
    }

    if (typeof warehouseName !== "undefined") {
      updateData.warehouse = warehouse ? warehouse._id : null;
    }

    // Optional role change
    if (roleName) {
      // Find role by name instead of ID
      const role = await Role.findOne({ name: roleName, isActive: true });
      // console.log("role", role);

      if (!role) {
        // Get available roles for better error message
        const availableRoles = await Role.find({ isActive: true }).select(
          "name",
        );
        // console.log("availableRoles", availableRoles);

        return res.status(400).json({
          success: false,
          message: `Invalid role specified. Available roles: ${availableRoles
            .map((r) => r.name)
            .join(", ")}`,
        });
      }
      updateData.role = role._id;
    }

    const updateUser = await User.findByIdAndUpdate(
      existingUser._id,
      updateData,
      { new: true },
    );
    // console.log("updateUser: ", updateUser);

    res.status(201).json({
      success: true,
      message: customMessage.updated("User", userId),
      data: {
        user: {
          id: updateUser!._id.toString(),
          name: updateUser!.name,
        },
      },
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

    console.error("update user error: ", error.message);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete user
const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("User", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("User", id),
      id,
    });
  } catch (error: any) {
    console.error("Delete user error: ", error.message);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createUser, userList, userProfile, updateUser, deleteUser };
