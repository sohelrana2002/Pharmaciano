import { Schema, model } from "mongoose";
import { IOrganization } from "../types";

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    tradeLicenseNo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    drugLicenseNo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    vatRegistrationNo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    contact: {
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
    },

    subscriptionPlan: {
      type: String,
      enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
      default: "FREE",
    },

    isActive: { type: Boolean, default: true },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IOrganization>("Organization", organizationSchema);
