/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import Role from "../models/Role.model";
import { config } from "../config/config";
import dayjs from "dayjs";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    features: string[];
  };
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email, isActive: true }).populate("role");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }
    // update last login
    const date = new Date(); // lastLogin
    const formatted = dayjs(date).format("DD-MMM-YYYY hh:mm:ss A");
    user.lastLogin = formatted;
    await user.save();

    const role = await Role.findById(user.role._id);
    if (!role || !role.isActive) {
      return res.status(401).json({
        success: false,
        message: "User role is invalid or inactive.",
      });
    }
    // console.log("Role info", role);

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: role.name,
        features: role.features,
        lastLogin: user.lastLogin,
      },
      config.jwtSecret,
      { expiresIn: config.tokenExpireIn },
    );

    res.json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: role.name,
          lastLogin: user.lastLogin,
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
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId)
      .populate("role")
      .select("-password");
    // console.log("user", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const role = await Role.findById(user.role._id).populate<{
      createdBy: any;
    }>({
      path: "createdBy",
      select: "-password",
    });

    // console.log("role info:", role);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: role.name,
          features: role.features,
          createdBy: role.createdBy.name,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { login, getProfile };
