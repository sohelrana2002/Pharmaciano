/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { parseMedicineInput } from "../helper/parseMedicineInput";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Branch from "../models/Branch.model";
import Medicine from "../models/Medicine.model";
import Organization from "../models/Organization.model";
import { Purchase } from "../models/purchase.model";
import Supplier from "../models/Supplier.model";
import { AuthRequest } from "../types";
import { Response } from "express";

// create purchase
const createPurchase = async (req: AuthRequest, res: Response) => {
  try {
    const superAdmin = isSuperAdmin(req.user);

    const {
      items,
      supplier,
      organizationName,
      branchName,
      paymentStatus,
      paidAmount,
    } = req.validatedData;

    let organizationId = req.user!.organizationId;
    let branchId = req.user!.branchId;

    if (superAdmin) {
      // manage organizaton
      if (organizationName) {
        const organization = await Organization.findOne({
          name: organizationName,
          isActive: true,
        });

        if (!organization) {
          const activeOrganization = await Organization.find({
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Organization"),
            hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
          });
        }
        organizationId = organization._id.toString();
      }

      // manage branch
      if (branchName) {
        const branch = await Branch.findOne({
          name: branchName,
          organizationId,
          isActive: true,
        });

        if (!branch) {
          const activeBranch = await Branch.find({
            organizationId,
            isActive: true,
          }).select("name");

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Branch"),
            hints: `Active branch names are: ${activeBranch.map((bra) => bra.name).join(", ")}`,
          });
        }
        branchId = branch._id.toString();
      }
    }

    const purchaseItems: any[] = [];

    // Process each purchase item
    for (const item of items) {
      const { name, strength, unit } = parseMedicineInput(item.medicineName);

      // Find medicine by name + strength + unit
      const medicineQuery: any = {
        isActive: true,
        organizationId,
        name: { $regex: `^${name}$`, $options: "i" },
      };
      if (strength) medicineQuery.strength = strength;
      if (unit) medicineQuery.unit = unit;

      const medicine = await Medicine.findOne(medicineQuery);

      if (!medicine) {
        const activeMedicine = await Medicine.find({
          isActive: true,
          organizationId,
        }).select("name strength unit");

        return res.status(404).json({
          success: false,
          message: `Medicine '${item.medicineName}' not found`,
          hints: `Active medicines: ${activeMedicine
            .map((m) => `${m.name} ${m.strength}${m.unit}`)
            .join(", ")}`,
        });
      }

      purchaseItems.push({
        medicineId: medicine._id,
        medicineName: `${medicine.name} ${medicine.strength}${medicine.unit}`,
        quantity: item.quantity,
      });
    }

    //   manage supplier
    const supplierCompany = await Supplier.findOne({ name: supplier });

    if (!supplierCompany) {
      const activeSupplier = await Supplier.find().select("name");

      return res.status(404).json({
        success: false,
        message: `Supplier company not found`,
        hints: `Active supplier company are: ${activeSupplier
          .map((s) => s.name)
          .join(", ")}`,
      });
    }

    const purchaseNo = `PUR-${Date.now()}`;

    const purchase = await Purchase.create({
      organizationId,
      branchId,
      supplierId: supplierCompany._id,
      items: purchaseItems,
      warehouseId: null,
      purchaseNo,
      status: "pending",
      subtotal: 0,
      discount: 0,
      tax: 0,
      totalAmount: 0,
      approvedBy: null,
      paymentStatus,
      paidAmount,
      dueAmount: 0,
    });

    return res.status(201).json({
      success: true,
      message: customMessage.created("Purchase"),
      id: purchase._id,
      purchaseNo,
    });
  } catch (error: any) {
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
    console.error("create purchase error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// approve purchase
const approvePurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const superAdmin = isSuperAdmin(req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    const purchase = await Purchase.findOne(filter);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Purchase", id),
      });
    }

    if (purchase.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending status can be approved!",
      });
    }

    purchase.status = "approved";
    purchase.approvedBy = new mongoose.Types.ObjectId(req.user!.userId);

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Purchase approved successfully!",
      id,
    });
  } catch (error) {
    console.error("approve purchase error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createPurchase, approvePurchase };
