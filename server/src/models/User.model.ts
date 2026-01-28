/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "../types";
import Role from "./Role.model";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    orgName: {
      type: String,
      validate: {
        validator: async function (this: any, value: string | null) {
          const role = await Role.findById(this.role).lean();

          if (!role) return false;

          if (role.name === "Super Admin") {
            return value === null;
          }

          return Boolean(value);
        },
        message: "Organization name is required for non-super-admin users",
      },
      trim: true,
      lowercase: true,
    },

    branchName: {
      type: String,
      validate: {
        validator: async function (this: any, value: string | null) {
          const role = await Role.findById(this.role).lean();

          if (!role) return false;

          if (role.name === "Super Admin") {
            return value === null;
          }

          return Boolean(value);
        },
        message: "Branch name is required for non-super-admin users",
      },
      trim: true,
      lowercase: true,
    },

    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      lowercase: true,
    },

    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      validate: {
        validator: async function (this: any, value: string | null) {
          const role = await Role.findById(this.role).lean();

          if (!role) return false;

          if (role.name === "Super Admin") {
            return value === null;
          }

          return Boolean(value);
        },
        message: "Organization is required for non-super-admin users",
      },
      lowercase: true,
    },

    branch: {
      type: Schema.Types.ObjectId,
      ref: "Branch",
      validate: {
        validator: async function (this: any, value: string | null) {
          const role = await Role.findById(this.role).lean();

          if (!role) return false;

          if (role.name === "Super Admin") {
            return value === null;
          }

          return Boolean(value);
        },
        message: "Branch name is required for non-super-admin users",
      },
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastLogin: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const saltRound = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(this.password, saltRound);
    this.password = hashPassword;
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser>("User", userSchema);
