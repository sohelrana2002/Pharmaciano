import { Schema, model } from "mongoose";
import { IBrand } from "../types";

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
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
  { timestamps: true }
);

export default model<IBrand>("Brand", brandSchema);
