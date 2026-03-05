import { Schema, model } from "mongoose";
import { IInventoryBatch } from "../types";

const inventoryBatchSchema = new Schema<IInventoryBatch>(
  {
    orgName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    medicineName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    medicineId: {
      type: Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    batchNo: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    warehouseName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export default model<IInventoryBatch>("InventoryBatch", inventoryBatchSchema);
