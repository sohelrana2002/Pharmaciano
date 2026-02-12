/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.model";
import Role from "../models/Role.model";
import { AuthRequest } from "../types";
import { config } from "../config/config";

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    // In your auth middleware
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Remove "Bearer " prefix if present, otherwise use the entire header
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    // console.log("decoded", decoded);

    const user = await User.findById(decoded.userId)
      .populate("roleId")
      .select("-password");

    // console.log("user", user);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or user is inactive.",
      });
    }

    const role = await Role.findById(user!.roleId!._id);
    if (!role || !role.isActive) {
      return res.status(401).json({
        success: false,
        message: "Role is invalid or inactive.",
      });
    }

    // console.log("role info: ", role);

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: role.name,
      permissions: role.permissions,
    };

    next();
  } catch (error) {
    console.log("Invalid token.", error);

    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export const authorize = (requiredPermissions: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // get user info from jwt payload. payload name is user
    const existUser = req.user;
    // console.log("existUser", existUser);

    if (!existUser) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const hasAccess = requiredPermissions.every((permission) => {
      return existUser!.permissions.includes(permission);
    });
    // console.log("hasAccess", hasAccess);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to access this resource.",
      });
    }

    next();
  };
};

export const isSuperAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role !== "Super Admin") {
    return res.status(403).json({
      success: false,
      message: "Super admin access required.",
    });
  }
  next();
};
