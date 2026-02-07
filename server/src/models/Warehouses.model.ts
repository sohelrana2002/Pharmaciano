import { Schema, model } from "mongoose";
import { IWarehouses } from "../types";

const wareHousesSchema = new Schema<IWarehouses>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    branchName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
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

export default model<IWarehouses>("Warehouse", wareHousesSchema);
