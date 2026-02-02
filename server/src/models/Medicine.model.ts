import { Schema, model } from "mongoose";
import { IMedicine } from "../types";

const medicineSchema = new Schema<IMedicine>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    genericName: {
      type: String,
      required: true,
      trim: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    dosageForm: {
      type: String,
      required: true,
      trim: true,
    },
    strength: {
      type: String,
      required: true,
      trim: true,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    mrp: {
      type: Number,
      required: true,
    },

    isPrescriptionRequired: {
      type: Boolean,
      default: false,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
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

medicineSchema.index(
  {
    genericName: 1,
    strength: 1,
    dosageForm: 1,
    brand: 1,
  },
  {
    unique: true,
  },
);

export default model<IMedicine>("Medicine", medicineSchema);
