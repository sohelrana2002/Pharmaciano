/* eslint-disable @typescript-eslint/no-explicit-any */

import { customMessage } from "../constants/customMessage";
import { AuthRequest } from "../types";
import { Response } from "express";
import { supplierSchemaValidator } from "../validators/supplier.validator";
import Supplier from "../models/Supplier.model";

// create supplier
const createSupplier = async (req: AuthRequest, res: Response) => {
  try {
    //   Validate request body using zod
    const validationResult = supplierSchemaValidator.safeParse(req.body);

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

    const { name, contactPerson, phone, email, address, isActive } =
      validationResult.data;

    //   check if supplier alreday exist
    const supplierExist = await Supplier.findOne({ name });

    if (supplierExist) {
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists("Supplier name"),
      });
    }

    const supplier = new Supplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      isActive,
      createdBy: req.user!.userId,
    });

    await supplier.save();

    return res.status(201).json({
      success: true,
      message: customMessage.created("Supplier"),
      id: supplier._id,
    });
  } catch (error: any) {
    //   mongoDb duplicate key error
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
  }
};

export { createSupplier };
