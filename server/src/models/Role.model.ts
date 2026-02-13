/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from "mongoose";
import { IRole } from "../types";

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
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

// always save with "user:read" permissions
roleSchema.pre("save", function (next) {
  this.permissions = [...new Set([...this.permissions, "user:read"])];
  next();
});

// always save with "user:read" permissions when update
roleSchema.pre("findOneAndUpdate", function (next) {
  const update: any = this.getUpdate();

  if (update.permissions) {
    update.permissions = [...new Set([...update.permissions, "user:read"])];
  }

  next();
});

export default model<IRole>("Role", roleSchema);
