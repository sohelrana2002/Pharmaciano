/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Types } from "mongoose";
import { Request } from "express";

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
    organizationId: string;
    branchId: string;
    warehouseId: string;
    phone: string | null;
  };
  validatedData?: any;
}

// brand interface
export interface IBrand extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
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
  organizationId: Types.ObjectId;
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
  isActive: boolean;
  organizationId: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// medicine interface
export interface IMedicine extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
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
  barcode: string;
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
  organizationId: Types.ObjectId;
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

export type InventoryBatchStatus = "active" | "expired";
// InventoryBatch interface
export interface IInventoryBatch extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  medicineName: string;
  medicineId: Types.ObjectId;
  batchNo: string;
  expiryDate: Date;
  quantity: number;
  purchasePrice: number;
  warehouseId: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: InventoryBatchStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// salesItem interface
export interface ISaleItem extends Document {
  medicineId: Types.ObjectId;
  medicineName: string;
  batchNo: string;
  quantity: number;
  sellingPrice: number;
  purchasePrice: number;
}

// sale interface
export interface ISale extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  cashierId: Types.ObjectId;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: "cash" | "card" | "mobile";
  createdAt?: Date;
  updatedAt?: Date;
}

// purchase interface
export interface IPurchaseItem extends Document {
  medicineId: Types.ObjectId;
  medicineName: string;
  batchNo: string;
  expiryDate: Date;
  quantity: number;
  purchasePrice: number;
  totalCost: number;
}

export type purchaseStatus = "pending" | "approved" | "received";

// Purchase interface
export interface IPurchase extends Document {
  _id: Types.ObjectId;
  organizationId: Types.ObjectId;
  branchId: Types.ObjectId;
  supplierId: Types.ObjectId;
  warehouseId: Types.ObjectId;
  items: IPurchaseItem[];
  purchaseNo: string;
  status: purchaseStatus;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  approvedBy?: Types.ObjectId;
  paymentStatus: "unpaid" | "partial" | "paid";
  paidAmount: number;
  dueAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
