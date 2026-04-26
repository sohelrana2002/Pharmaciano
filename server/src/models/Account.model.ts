import { Schema, model } from "mongoose";
import { IAccount } from "../types";

const accountSchema = new Schema<IAccount>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ["asset", "liability", "income", "expense", "equity"],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// prevent duplicate code per organizaton
accountSchema.index({ code: 1, organizationId: 1 }, { unique: true });

export const Account = model<IAccount>("Account", accountSchema);
