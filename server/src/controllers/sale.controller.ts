/* eslint-disable @typescript-eslint/no-explicit-any */

import { Response } from "express";
import { AuthRequest } from "../types";
import { saleSchemaValidator } from "../validators/sale.validator";
import InventoryBatch from "../models/InventoryBatch.model";
import Medicine from "../models/Medicine.model";
import Sale from "../models/Sale.model";
import { customMessage } from "../constants/customMessage";

const createSale = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = saleSchemaValidator.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        })),
      });
    }

    const { customerName, customerPhone, items, discount, tax, paymentMethod } =
      validationResult.data;

    const saleItems: any[] = [];

    // Get active medicine list (optimization)
    const activeMedicine = await Medicine.find({ isActive: true }).select(
      "name",
    );

    for (const item of items) {
      const medicine = await Medicine.findOne({
        name: item.medicineName,
        isActive: true,
      });

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: "Invalid medicine name.",
          hints: `Active medicine names are ${activeMedicine
            .map((m) => m.name)
            .join(", ")}`,
        });
      }

      const batch = await InventoryBatch.findOne({
        medicineId: medicine._id,
        batchNo: item.batchNo,
        branchId: req.user!.branchId,
        organizationId: req.user!.organizationId,
        status: "active",
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: `Batch ${item.batchNo} not found for ${item.medicineName}`,
        });
      }

      if (batch.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.medicineName}. Available: ${batch.quantity}`,
        });
      }

      // deduct stock
      batch.quantity -= item.quantity;
      await batch.save();

      saleItems.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        batchNo: item.batchNo,
        quantity: item.quantity,
        sellingPrice: item.sellingPrice,
      });
    }

    // calculate subtotal
    const subtotal = saleItems.reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0,
    );

    const totalAmount = subtotal - discount + tax;

    // generate invoice number
    const lastSale = await Sale.findOne().sort({ createdAt: -1 });

    const invoiceNo = lastSale
      ? `INV-${parseInt(lastSale.invoiceNo.split("-")[1]) + 1}`
      : "INV-1001";

    // create sale
    const sale = await Sale.create({
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
      cashierId: req.user!.userId,

      invoiceNo,
      customerName,
      customerPhone,

      items: saleItems,

      subtotal,
      discount,
      tax,
      totalAmount,

      paymentMethod,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Sale"),
      id: sale._id,
    });
  } catch (error: any) {
    console.error("create sale error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createSale };
