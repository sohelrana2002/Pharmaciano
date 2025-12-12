import { Document, Types } from 'mongoose';
import { Request } from 'express';

// user interface 
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password: string;
    name: string;
    role: Types.ObjectId | IRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
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