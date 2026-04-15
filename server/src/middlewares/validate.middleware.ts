/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../types";

type SchemaInput = z.ZodTypeAny | ((req: AuthRequest) => z.ZodTypeAny);

export const validate =
  (schema: SchemaInput) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const activeSchema = typeof schema === "function" ? schema(req) : schema;

      req.validatedData = await activeSchema.parseAsync(req.body);

      return next();
    } catch (error: any) {
      // Handle ZodError specifically
      if (error instanceof z.ZodError) {
        const issues = error.issues || [];

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: issues.map((issue: any) => ({
            field: issue.path?.join(".") || "unknown",
            message: issue.message || "Validation error",
          })),
        });
      }

      // Handle other errors
      return res.status(500).json({
        success: false,
        message: "Internal server error during validation",
      });
    }
  };
