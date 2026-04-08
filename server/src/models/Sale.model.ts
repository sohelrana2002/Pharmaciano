import { Schema, model } from "mongoose";
import { ISaleItem, ISale } from "../types";

const saleItemSchema = new Schema<ISaleItem>(
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
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sellingPrice: {
      type: Number,
      default: 0,
    },
    purchasePrice: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const saleSchema = new Schema<ISale>(
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
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    items: {
      type: [saleItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
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
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "mobile"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ISale>("Sale", saleSchema);
