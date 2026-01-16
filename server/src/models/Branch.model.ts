import { Schema, model } from "mongoose";
import { IBranch } from "../types";

const BranchSchema = new Schema<IBranch>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
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

    orgName: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IBranch>("Branch", BranchSchema);
