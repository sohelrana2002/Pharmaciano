/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validatedData = await schema.parseAsync(req.body);

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
