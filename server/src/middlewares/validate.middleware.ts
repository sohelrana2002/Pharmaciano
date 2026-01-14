/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodType<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Use parse() instead of safeParse() - it will throw an error
      const validatedData = schema.parse(req.body);
      (req as any).validatedData = validatedData;
      next();
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
