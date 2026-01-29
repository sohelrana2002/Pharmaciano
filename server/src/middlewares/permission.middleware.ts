/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import Role from "../models/Role.model";

export const requireFeature = (feature: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      // superadmin shortcut: permissions ['*'] equals full access
      const role = await Role.findById(user.role);
      if (!role) return res.status(403).json({ message: "No role assigned" });

      if (role.permissions.includes("*") || role.permissions.includes(feature))
        return next();

      return res
        .status(403)
        .json({ message: "Forbidden - missing feature access" });
    } catch (err: any) {
      console.error("Internal server error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
