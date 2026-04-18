/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { customMessage } from "../constants/customMessage";
import { parseMedicineInput } from "../helper/parseMedicineInput";
import { isSuperAdmin } from "../middlewares/auth.middleware";
import Branch from "../models/Branch.model";
import { Medicine } from "../models/Medicine.model";
import Organization from "../models/Organization.model";
import { Purchase } from "../models/purchase.model";
import Supplier from "../models/Supplier.model";
import { AuthRequest } from "../types";
import { Response } from "express";
import InventoryBatch from "../models/InventoryBatch.model";
import Warehouse from "../models/Warehouse.model";

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
      warehouseName,
    } = req.validatedData;

    let organizationId = req.user!.organizationId;
    let branchId = req.user!.branchId;
    let warehouseId;

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

    // update warehouse
    if (warehouseName) {
      const warehouse = await Warehouse.findOne({
        name: warehouseName,
        organizationId,
        branchId,
        isActive: true,
      });

      if (!warehouse) {
        const activeWarehouse = await Warehouse.find({
          organizationId,
          branchId,
          isActive: true,
        }).select("name");

        return res.status(404).json({
          success: false,
          message: customMessage.notFound("Warehuse"),
          hints: `Active warehouse are: ${activeWarehouse.map((ware) => ware.name).join(", ")}`,
        });
      }
      warehouseId = warehouse._id;
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
      warehouseId,
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

// receive Purchase inventory batch update here
const receivePurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const superAdmin = isSuperAdmin(req.user);

    const { items, paymentStatus, paidAmount, discount, tax } =
      req.validatedData;

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

    if (purchase.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved status can be received!",
      });
    }

    //CREATE MAP FROM EXISTING PURCHASE (medicineId → item)
    const purchaseItemMap = new Map<string, any>();

    for (const item of purchase.items) {
      purchaseItemMap.set(item.medicineId.toString(), item);
    }

    const updatedItems: any[] = [];

    // VALIDATE + MAP ITEMS
    for (const incomingItem of items) {
      const { name, strength, unit } = parseMedicineInput(
        incomingItem.medicineName,
      );

      //convert name to medicineId
      const medicineQuery: any = {
        isActive: true,
        organizationId: purchase.organizationId,
        name: { $regex: `^${name}$`, $options: "i" },
      };

      if (strength) medicineQuery.strength = strength;
      if (unit) medicineQuery.unit = unit;

      const medicine = await Medicine.findOne(medicineQuery);

      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${incomingItem.medicineName}`,
        });
      }

      const medicineId = medicine._id.toString();

      // MUST EXIST IN ORIGINAL PURCHASE
      const existingItem = purchaseItemMap.get(medicineId);

      if (!existingItem) {
        return res.status(400).json({
          success: false,
          message: `Medicine not in original purchase: ${incomingItem.medicineName}`,
        });
      }

      // STRICT DUPLICATE CHECK (UPDATE SIDE)
      const duplicate = updatedItems.find(
        (i) => i.medicineId.toString() === medicineId,
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Duplicate medicine in request: ${incomingItem.medicineName}`,
        });
      }

      const quantity = existingItem.quantity;

      const purchasePrice =
        incomingItem.purchasePrice ?? existingItem.purchasePrice ?? 0;

      if (purchasePrice == null || isNaN(purchasePrice)) {
        return res.status(400).json({
          success: false,
          message: `Invalid purchase price: ${incomingItem.medicineName}`,
        });
      }

      updatedItems.push({
        ...existingItem.toObject(),

        medicineId: medicine._id,

        batchNo: incomingItem.batchNo ?? existingItem.batchNo,
        expiryDate: incomingItem.expiryDate ?? existingItem.expiryDate,
        quantity,
        purchasePrice,

        totalCost: quantity * purchasePrice,
      });
    }

    // LENGTH MUST MATCH EXACTLY
    if (updatedItems.length !== purchase.items.length) {
      return res.status(400).json({
        success: false,
        message: `You must update exactly ${purchase.items.length} items`,
      });
    }

    purchase.items = updatedItems;

    purchase.paymentStatus = paymentStatus;
    purchase.paidAmount = paidAmount;
    purchase.approvedBy = new mongoose.Types.ObjectId(req.user!.userId);
    purchase.discount = discount;
    purchase.tax = tax;

    // calculate amounts
    const subtotal = purchase.items.reduce(
      (sum, item) => sum + item.totalCost,
      0,
    );

    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;

    const totalAmount = subtotal - discountAmount + taxAmount;
    const dueAmount = totalAmount - purchase.paidAmount;

    purchase.subtotal = subtotal;
    purchase.totalAmount = totalAmount;
    purchase.dueAmount = dueAmount;

    // console.log("after purchse: ", purchase);

    // now inventory batch update
    for (const item of purchase.items) {
      const existingBatch = await InventoryBatch.findOne({
        medicineId: item.medicineId,
        batchNo: item.batchNo,
        organizationId: purchase.organizationId,
        branchId: purchase.branchId,
      });

      if (existingBatch) {
        await InventoryBatch.updateOne(
          { _id: existingBatch._id },
          {
            $inc: { quantity: item.quantity },
            $set: {
              expiryDate: item.expiryDate,
              purchasePrice: item.purchasePrice,
            },
          },
        );
      } else {
        await InventoryBatch.create({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          organizationId: purchase.organizationId,
          branchId: purchase.branchId,
          warehouseId: purchase.warehouseId,
          createdBy: purchase.approvedBy,
        });
      }
    }

    purchase.status = "received";

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Purchase receive successfully & update inventory batch!",
      id,
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
    console.error("receive purchase error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// list of purchase
const purchaseList = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, paymentStatus, fromDate, toDate, page, limit } =
      req.query;

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = {};

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    // status filter
    if (status) filter.status = status;

    // payment status filter
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    // date range filter
    if (fromDate && toDate) {
      filter.createdAt = {
        $gte: new Date(fromDate as string),
        $lte: new Date(toDate as string),
      };
    }

    // search filter
    if (search) {
      filter.$or = [{ purchaseNo: { $regex: search, $options: "i" } }];
    }

    // pagination
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const purchase = await Purchase.find(filter)
      .populate([
        {
          path: "supplierId",
          select: "name contactPerson -_id",
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
        {
          path: "warehouseId",
          select: "name -_id",
        },
        {
          path: "approvedBy",
          select: "name email -_id",
        },
      ])
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    // counts
    const total = await Purchase.countDocuments({ ...filter });

    const pendingStatus = await Purchase.countDocuments({
      ...filter,
      status: "pending",
    });

    const approvedStatus = await Purchase.countDocuments({
      ...filter,
      status: "approved",
    });

    const receivedStatus = await Purchase.countDocuments({
      ...filter,
      status: "received",
    });

    return res.status(200).json({
      success: true,
      message:
        purchase.length > 0
          ? customMessage.found("Purchase")
          : "No purchase found",

      meta: {
        page: pageNumber,
        limit: limitNumber,
        count: purchase.length,
      },

      total,
      pending: pendingStatus,
      approved: approvedStatus,
      received: receivedStatus,
      data: { purchase },
    });
  } catch (error) {
    console.error("list of purchase error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// purchase info
const purchaseInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    const purchase = await Purchase.findOne(filter).populate([
      {
        path: "supplierId",
        select: "name contactPerson phone email address -_id",
      },
      {
        path: "items.medicineId",
        select:
          "-organizationId -createdAt -updatedAt -__v -taxRate -categoryId -brandId -createdBy -isActive -_id",
      },
      {
        path: "organizationId",
        select: "name contact address -_id",
      },
      {
        path: "branchId",
        select: "name contact address -_id",
      },
      {
        path: "warehouseId",
        select: "name location -_id",
      },
      {
        path: "approvedBy",
        select: "name email phone -_id",
      },
    ]);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Purchase", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.found("Purchase", id),
      data: { purchase },
    });
  } catch (error) {
    console.error("purchase info error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

// delete purchase
const deletePurchase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(409).json({
        success: false,
        message: customMessage.invalidId("Mongoose", id),
      });
    }

    const superAdmin = isSuperAdmin(req.user);

    const filter: any = { _id: id };

    if (!superAdmin) {
      filter.organizationId = req.user!.organizationId;
      filter.branchId = req.user!.branchId;
    }

    const purchase = await Purchase.findByIdAndDelete(filter);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: customMessage.notFound("Purchase", id),
      });
    }

    return res.status(200).json({
      success: true,
      message: customMessage.deleted("Purchase", id),
      id,
    });
  } catch (error) {
    console.error("delete purchase error:", error);

    res.status(500).json({
      success: false,
      message: customMessage.serverError(),
    });
  }
};

export {
  createPurchase,
  approvePurchase,
  receivePurchase,
  purchaseList,
  purchaseInfo,
  deletePurchase,
};
