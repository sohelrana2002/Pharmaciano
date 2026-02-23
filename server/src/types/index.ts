import { Document, Types } from "mongoose";
import { Request } from "express";
// import mongoose from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  roleId?: Types.ObjectId;
  organizationId?: Types.ObjectId | null;
  branchId?: Types.ObjectId | null;
  warehouseId?: Types.ObjectId | null;
  phone?: string | null;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  lastLogin?: Date | string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// role interface
export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  permissions: string[];
  createdBy: Types.ObjectId | IUser;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// feature interface
export interface IFeature extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

// authrequest interface
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

// brand interface
export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  manufacturer: string;
  country: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// category interface
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// organizarion interface
export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  tradeLicenseNo: string;
  drugLicenseNo: string;
  vatRegistrationNo?: string;
  address: string;
  contact: {
    phone: string;
    email: string;
  };
  subscriptionPlan: "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Branch Interface
export interface IBranch extends Document {
  _id: Types.ObjectId;
  name: string;
  address: string;
  contact: {
    phone: string;
    email: string;
  };
  orgName: string;
  isActive: boolean;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// medicine interface
export interface IMedicine extends Document {
  _id: Types.ObjectId;
  name: string;
  genericName: string;
  categoryName: string;
  brandName: string;
  dosageForm: string;
  strength: string;
  unit: string;
  unitPrice: number;
  unitsPerStrip: number;
  stripPrice: number;
  isPrescriptionRequired: boolean;
  taxRate: number;
  categoryId: Types.ObjectId;
  brandId: Types.ObjectId;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// warehouses interface
export interface IWarehouse extends Document {
  _id: Types.ObjectId;
  name: string;
  location: string;
  capacity: number;
  branchName: string;
  isActive: boolean;
  branchId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Supplier interface
export interface ISupplier extends Document {
  _id: Types.ObjectId;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
