import { Document, Types } from "mongoose";
import { Request } from "express";
// import mongoose from 'mongoose';

// user interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  orgName: string;
  branchName: string;
  role: Types.ObjectId | IRole;
  organization: Types.ObjectId;
  branch: Types.ObjectId;
  isActive: boolean;
  lastLogin: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// role interface
export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  features: string[];
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
    features: string[];
  };
}

// create user request interface
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
}

// create role request interface
export interface CreateRoleRequest extends Request {
  name: string;
  description: string;
  features: string[];
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
  organization: Types.ObjectId;
  createdBy: Types.ObjectId;
  name: string;
  address: string;
  contact: {
    phone: string;
    email: string;
  };
  orgName: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
