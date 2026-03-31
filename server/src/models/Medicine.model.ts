import { Schema, model } from "mongoose";
import { IMedicine } from "../types";

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    genericName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    categoryName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    brandName: {
      type: String,
      lowercase: true,
      trim: true,
    },
    dosageForm: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    strength: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
    },
    unitsPerStrip: {
      type: Number,
    },
    stripPrice: {
      type: Number,
      default: 0,
    },
    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

medicineSchema.index(
  {
    name: 1,
    genericName: 1,
    strength: 1,
    dosageForm: 1,
    unit: 1,
    brandId: 1,
    organizationId: 1,
  },
  { unique: true },
);

export default model<IMedicine>("Medicine", medicineSchema);
