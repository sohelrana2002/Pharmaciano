/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { AuthRequest } from "../types";
import { saleSchemaValidator } from "../validators/sale.validator";
import InventoryBatch from "../models/InventoryBatch.model";
import Medicine from "../models/Medicine.model";
import Sale from "../models/Sale.model";
import { customMessage } from "../constants/customMessage";

// Parse medicine input like "napa 500mg" or "napa 500 mg"
function parseMedicineInput(input: string) {
  input = input.trim();
  const match = input.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
  if (match) {
    const strength = match[1];
    const unit = match[2];
    const name = input.slice(0, match.index).trim();
    return { name, strength, unit };
  }
  return { name: input, strength: "", unit: "" };
}

const createSale = async (req: AuthRequest, res: Response) => {
  try {
    // Validate input
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

    const {
      customerName,
      customerPhone,
      items,
      discount = 0,
      tax = 0,
      paymentMethod,
    } = validationResult.data;
    const saleItems: any[] = [];

    // Process each sale item
    for (const item of items) {
      const { name, strength, unit } = parseMedicineInput(item.medicineName);
      // console.log("item:", item);

      // Find medicine by name + strength + unit
      const medicineQuery: any = {
        isActive: true,
        name: { $regex: `^${name}$`, $options: "i" },
      };
      if (strength) medicineQuery.strength = strength;
      if (unit) medicineQuery.unit = unit;

      const medicine = await Medicine.findOne(medicineQuery);
      if (!medicine) {
        const activeMedicine = await Medicine.find({ isActive: true }).select(
          "name strength unit",
        );
        return res.status(404).json({
          success: false,
          message: `Medicine '${item.medicineName}' not found`,
          hints: `Active medicines: ${activeMedicine
            .map((m) => `${m.name} ${m.strength}${m.unit}`)
            .join(", ")}`,
        });
      }
      // console.log("medicine: ", medicine);

      // Find batch by batchNo and check quantity
      const batch = await InventoryBatch.findOne({
        medicineId: medicine._id,
        batchNo: item.batchNo,
        status: "active",
      });
      // console.log("batch: ", batch);

      let availableBatches;

      // If batch not found, provide available batches
      if (!batch) {
        availableBatches = await InventoryBatch.find({
          medicineId: medicine._id,
          status: "active",
        }).select("batchNo");

        return res.status(404).json({
          success: false,
          message: `Batch ${item.batchNo} not found`,
          hint: `Available branch name are ${availableBatches.map((b) => b.batchNo).join(", ")}`,
        });
      }

      if (batch.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${
            medicine.name
          }.Available: ${batch.quantity}`,
        });
      }

      // Atomic stock update
      await InventoryBatch.updateOne(
        { _id: batch._id, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
      );

      saleItems.push({
        medicineId: medicine._id,
        medicineName: `${medicine.name} ${medicine.strength}${medicine.unit}`,
        batchNo: batch.batchNo,
        quantity: item.quantity,
        sellingPrice: medicine.unitPrice,
        purchasePrice: batch.purchasePrice,
      });
    }

    // Calculate totals
    const subtotal = saleItems.reduce(
      (sum, i) => sum + i.quantity * i.sellingPrice,
      0,
    );
    const discountAmount = (subtotal * discount) / 100;
    const totalAmount = subtotal - discountAmount + tax;

    // Generate sequential invoice number
    const lastSale = await Sale.findOne({
      organizationId: req.user!.organizationId,
      branchId: req.user!.branchId,
    }).sort({ createdAt: -1 });

    const invoiceNo = lastSale
      ? `INV-${parseInt(lastSale.invoiceNo.split("-")[1]) + 1}`
      : "INV-1001";

    // Create sale
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
      invoiceNo,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists(value),
        error: { field, value, reason: customMessage.alreadyExists(field) },
      });
    }
    console.error("create sale error:", error);
    res
      .status(500)
      .json({ success: false, message: customMessage.serverError() });
  }
};

export { createSale };
