import { Schema, model } from "mongoose";
import { IPurchaseItem, IPurchase } from "../types";

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    batchNo: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
    },
    totalCost: {
      type: Number,
    },
  },
  { _id: false },
);

const purchaseSchema = new Schema<IPurchase>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
    },
    purchaseNo: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "received"],
      default: "pending",
    },
    subtotal: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },
    paidAmount: {
      type: Number,
    },
    dueAmount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

export const Purchase = model<IPurchase>("Purchase", purchaseSchema);
