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

    console.error("create  error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of suppliers
const supplierList = async (req: AuthRequest, res: Response) => {
  try {
    const supplier = await Supplier.find({ isActive: true }).select(
      "-createdBy",
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Supplier"),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Suppliers"),
      length: supplier.length,
      data: { supplier },
    });
  } catch (error) {
    console.error("list of supplier  error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createSupplier, supplierList };
