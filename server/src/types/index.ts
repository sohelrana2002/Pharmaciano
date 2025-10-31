import { Document, Types } from 'mongoose';
import { Request } from 'express';

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

export interface IFeature extends Document {
    _id: Types.ObjectId;
    name: string;
    description: string;
    category: string;
    isActive: boolean;
    createdAt: Date;
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
        features: string[];
    };
}
export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    role: string;
}

export interface CreateRoleRequest extends Request {
    name: string;
    description: string;
    features: string[];
}