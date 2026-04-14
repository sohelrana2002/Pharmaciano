/* eslint-disable @typescript-eslint/no-explicit-any */
import "express";

declare module "express-serve-static-core" {
  interface Request {
    validatedData?: any;
  }
}
