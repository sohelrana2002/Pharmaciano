/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from "express";
import { AuthRequest } from "../types";
import {
  saleSchemaValidator,
  updateSaleValidator,
} from "../validators/sale.validator";
import InventoryBatch from "../models/InventoryBatch.model";
import Medicine from "../models/Medicine.model";
import Sale from "../models/Sale.model";
import { customMessage } from "../constants/customMessage";
import mongoose from "mongoose";
import { parseMedicineInput } from "../helper/parseMedicineInput";
import Counter from "../models/Counter.model";
import { generateInvoicePDF } from "../shared/generateInvoice";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Organization from "../models/Organization.model";
import Branch from "../models/Branch.model";

const createSale = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const superAdmin = isSuperAdmin(req.user);

    // Validate input
    const validationResult = saleSchemaValidator.safeParse(req.body);
    if (!validationResult.success) {
      await session.abortTransaction();
      session.endSession();

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

    // only for super admin
    const { organizationName, branchName } = req.body;

    // dynamic assign
    let organizationId = req.user!.organizationId;
    let branchId = req.user!.branchId;

    if (superAdmin) {
      // manage organizaton
      if (!organizationName) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: "Organization name is required",
        });
      } else {
        const organization = await Organization.findOne({
          name: organizationName,
        }).session(session);

        if (!organization) {
          const activeOrganization = await Organization.find({
            isActive: true,
          })
            .select("name")
            .session(session);

          await session.abortTransaction();
          session.endSession();

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Organization"),
            hints: `Active organization names are: ${activeOrganization.map((org) => org.name).join(", ")}`,
          });
        }
        organizationId = organization._id.toString();
      }

      // manage branch
      if (!branchName) {
        await session.abortTransaction();
        session.endSession();

        return res.status(400).json({
          success: false,
          message: "Branch name is required!",
        });
      } else {
        const branch = await Branch.findOne({
          name: branchName,
          organizationId,
        }).session(session);

        if (!branch) {
          const activeBranch = await Branch.find({
            organizationId,
            isActive: true,
          })
            .select("name")
            .session(session);

          await session.abortTransaction();
          session.endSession();

          return res.status(404).json({
            success: false,
            message: customMessage.notFound("Branch"),
            hints: `Active branch names are: ${activeBranch.map((bra) => bra.name).join(", ")}`,
          });
        }
        branchId = branch._id.toString();
      }
    }

    // Process each sale item
    for (const item of items) {
      const { name, strength, unit } = parseMedicineInput(item.medicineName);
      // console.log("item:", item);

      // Find medicine by name + strength + unit
      const medicineQuery: any = {
        isActive: true,
        organizationId,
        name: { $regex: `^${name}$`, $options: "i" },
      };
      if (strength) medicineQuery.strength = strength;
      if (unit) medicineQuery.unit = unit;

      const medicine = await Medicine.findOne(medicineQuery).session(session);

      if (!medicine) {
        const activeMedicine = await Medicine.find({
          isActive: true,
          organizationId,
        })
          .select("name strength unit")
          .session(session);

        await session.abortTransaction();
        session.endSession();

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
        organizationId,
        branchId,
        status: "active",
      }).session(session);
      // console.log("batch: ", batch);

      let availableBatches;

      // If batch not found, provide available batches
      if (!batch) {
        availableBatches = await InventoryBatch.find({
          medicineId: medicine._id,
          organizationId,
          branchId,
          status: "active",
        })
          .select("batchNo")
          .session(session);

        await session.abortTransaction();
        session.endSession();

        return res.status(404).json({
          success: false,
          message: `Batch ${item.batchNo} not found`,
          hint:
            availableBatches.length > 0
              ? `Available batchNo are: ${availableBatches.map((b) => b.batchNo).join(", ")}`
              : "No batches found!",
        });
      }

      if (batch.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();

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
        { session },
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
    const taxAmount = (subtotal * tax) / 100;

    const totalAmount = subtotal - discountAmount + taxAmount;

    // generate invoice number unique
    const counter = await Counter.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session },
    );

    const invoiceNo = `INV-100${counter.seq}`;

    // Create sale
    const sale = new Sale({
      organizationId,
      branchId,
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

    await sale.save({ session });

    // commit
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: customMessage.created("Sale"),
      id: sale._id,
      invoiceNo,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

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
    console.error("create sale error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of sales
const saleList = async (req: AuthRequest, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = {};

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    if (search) {
      filter.$or = [
        { invoiceNo: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const sales = await Sale.find(filter)
      .populate([
        {
          path: "cashierId",
          select: "name email -_id",
        },
        {
          path: "items.medicineId",
          select: "name strength unit unitPrice -_id",
        },
        {
          path: "organizationId",
          select: "name -_id",
        },
        {
          path: "branchId",
          select: "name -_id",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    // counts
    const total = await Sale.countDocuments({ ...filter });

    const activeCount = await Sale.countDocuments({
      ...filter,
      status: "active",
    });

    const expiredCount = await Sale.countDocuments({
      ...filter,
      status: "expired",
    });

    return res.status(200).json({
      success: true,
      message:
        sales.length > 0 ? customMessage.found("Sales") : "No sale found!",
      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: sales.length,
      },
      total,
      active: activeCount,
      expired: expiredCount,
      data: { sales },
    });
  } catch (error) {
    console.error("list of sale error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// individual sale info
const saleInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const sale = await Sale.findById(id).populate([
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "branchId",
        select: "name contact address -_id",
      },
      {
        path: "cashierId",
        select: "name email phone -_id",
      },
      {
        path: "warehouseId",
        select: "name location -_id",
      },
      {
        path: "items.medicineId",
        select: "-taxRate -categoryId -brandId -createdBy -isActive -_id",
      },
    ]);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Sale", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("sale", id),
      data: { sale },
    });
  } catch (error) {
    console.error("Individual sale info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// update sale
const updateSale = async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate Mongo ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    // Validate request body
    const validationResult = updateSaleValidator.safeParse(req.body);
    if (!validationResult.success) {
      await session.abortTransaction();
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

    // Find existing sale
    const existingSale = await Sale.findById(id).session(session);

    if (!existingSale) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Sale", id),
      });
    }

    //rollback old stock
    for (const oldItem of existingSale.items) {
      await InventoryBatch.updateOne(
        { batchNo: oldItem.batchNo }, // UNIQUE
        { $inc: { quantity: oldItem.quantity } },
        { session },
      );
    }

    // process new items
    let subtotal = 0;
    const processedItems: any[] = [];

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Items are required",
      });
    }

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
          hints: `Available medicines are: ${activeMedicine
            .map((m) => `${m.name} ${m.strength}${m.unit}`)
            .join(", ")}`,
        });
      }
      // console.log("medicine: ", medicine);

      const { quantity, batchNo } = item;

      // Find batch using  batchNo
      const batch = await InventoryBatch.findOne({
        medicineId: medicine._id,
        batchNo: item.batchNo,
        organizationId: req.user!.organizationId,
        branchId: req.user!.branchId,
        warehouseId: req.user!.warehouseId,
        status: "active",
      }).session(session);

      let availableBatches;
      // If batch not found, provide available batches
      if (!batch) {
        availableBatches = await InventoryBatch.find({
          medicineId: medicine._id,
          organizationId: req.user!.organizationId,
          branchId: req.user!.branchId,
          warehouseId: req.user!.warehouseId,
          status: "active",
        }).select("batchNo");

        return res.status(404).json({
          success: false,
          message: `Batch ${item.batchNo} not found`,
          hint:
            availableBatches.length > 0
              ? `Available branch name are ${availableBatches.map((b) => b.batchNo).join(", ")}`
              : "No batches found!",
        });
      }

      //Stock check
      if (batch.quantity < quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${medicine.name}. Available: ${batch.quantity}`,
        });
      }

      // Deduct stock
      batch.quantity -= quantity;
      await batch.save({ session });

      // Subtotal
      subtotal += quantity * medicine.unitPrice;

      // Save item
      processedItems.push({
        medicineId: medicine._id,
        medicineName: `${medicine.name} ${medicine.strength}${medicine.unit}`,
        batchNo,
        quantity,
        sellingPrice: medicine.unitPrice,
        purchasePrice: batch.purchasePrice,
      });
    }

    // calculation
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;

    const totalAmount = subtotal - discountAmount + taxAmount;

    // update sale
    await Sale.findByIdAndUpdate(
      id,
      {
        customerName,
        customerPhone,
        items: processedItems,
        subtotal,
        discount,
        tax,
        totalAmount,
        paymentMethod,
      },
      { new: true, session },
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: customMessage.updated("Sale", id),
      id,
    });
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error("update sale error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      return res.status(409).json({
        success: false,
        message: customMessage.alreadyExists(value),
      });
    }

    return res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete sale
const deleteSale = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const sale = await Sale.findByIdAndDelete(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Sale", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Sale", id),
      id,
    });
  } catch (error) {
    console.error("delete sale error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// create pdf
const createPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const sale = await Sale.findById(id).populate([
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "branchId",
        select: "name contact address -_id",
      },
      {
        path: "cashierId",
        select: "name email phone -_id",
      },
      {
        path: "warehouseId",
        select: "name location -_id",
      },
      {
        path: "items.medicineId",
        select: "-taxRate -categoryId -brandId -createdBy -isActive -_id",
      },
    ]);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Sale", id),
      });
    }

    return generateInvoicePDF(sale, res);
  } catch (error) {
    console.error("create invoice pdf error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export { createSale, saleList, saleInfo, updateSale, deleteSale, createPDF };
