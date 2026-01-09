/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import mongoose from "mongoose";
import User from "../models/UserModel";
import Role from "../models/RoleModel";
import { AuthRequest, IRole, IUser } from "../types";
import {
  createUserValidator,
  updateUserValidator,
} from "../validators/authValidator";
import { success } from "zod";
// import { CreateUserRequest } from '../types';

// create user
const createUser = async (req: AuthRequest, res: Response) => {
  try {
    // // Validate request body using Zod
    const validationResult = createUserValidator.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map(
          (err: { path: any[]; message: any }) => ({
            field: err.path.join("."),
            message: err.message,
          })
        ),
      });
    }

    const { email, password, name, role: roleName } = validationResult.data;
    // const { email, password, name, role: roleName }: CreateUserRequest = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email already exists.",
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
      role: role._id, // Use the role ID from the found role
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
    const users = await User.find()
      .populate<{ role: IRole & { createdBy: IUser } }>({
        path: "role",
        select: "-description",
        populate: {
          path: "createdBy",
          select: "name",
        },
      })
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
      .populate<{ role: IRole & { createdBy: IUser } }>({
        path: "role",
        populate: {
          path: "createdBy",
          select: "name email",
        },
      })
      .select("-password");

    res.status(200).json({
      success: success,
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
          })
        ),
      });
    }

    const { email, password, name, role: roleName } = validationResult.data;

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No user found.",
      });
    }

    //Build update object
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (password) updateData.password = password;

    // Optional role change
    if (roleName) {
      // Find role by name instead of ID
      const role = await Role.findOne({ name: roleName, isActive: true });

      // console.log("role", role);

      if (!role) {
        // Get available roles for better error message
        const availableRoles = await Role.find({ isActive: true }).select(
          "name"
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
      { new: true }
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
