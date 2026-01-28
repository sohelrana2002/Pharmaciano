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

// create user
const createUser = async (req: AuthRequest, res: Response) => {
  try {
    // // Validate request body using Zod
    const validationResult = createUserValidator.safeParse(req.body);

    console.log("req.user", req.user);

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
        hint: `Available organization names are ${activeOrganization.map((org) => org.name)}`,
      });
    }

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
    });

    await user.save();

    const savedUser = await User.findById(user._id)
      .populate<{ role: any }>("role", "name description features")
      .select("-password");

    // console.log("savedUser", savedUser);

    res.status(201).json({
      success: true,
      message: "User created successfully.",
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
        message: `${value} already exists`,
        error: {
          field,
          value,
          reason: `${field} already exists`,
        },
      });
    }

    console.error("Create user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
          select: "name features -_id",
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
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      length: users.length,
      data: { users },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
          select: "name description features -_id",
        },
        {
          path: "createdBy",
          select: "name name -_id",
        },
        {
          path: "organization",
          select: "name address contact -_id",
        },
        {
          path: "branch",
          select: "name contact address -_id",
        },
      ])
      .select("-password");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profie not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "Invalid user ID.",
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
    } = validationResult.data;

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No user found.",
      });
    }

    // Prevent duplicate fields (industry practice)
    if (email && email != existingUser.email) {
      const existing = await User.findOne({ email });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "User email already exist.",
        });
      }
    }

    //Build update object
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;

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
      message: "User update successfully.",
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
        message: `${value} already exists`,
        error: {
          field,
          value,
          reason: `${field} already exists`,
        },
      });
    }

    console.error("Create user error: ", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
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
        message: "No user found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      id,
    });
  } catch (error: any) {
    console.error("Delete user error: ", error.message);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { createUser, userList, userProfile, updateUser, deleteUser };
