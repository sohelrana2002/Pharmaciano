import { Schema, model } from "mongoose";
import { ISupplier } from "../types";

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    contactPerson: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ISupplier>("Supplier", supplierSchema);
