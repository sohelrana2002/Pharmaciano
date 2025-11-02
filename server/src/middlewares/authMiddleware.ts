/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest } from '../types';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        // console.log("decoded", decoded);


        const user = await User.findById(decoded.userId)
            .populate<{ role: any }>('role')
            .select('-password');

        // console.log("user", user);


        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or user is inactive.'
            });
        }

        const role = await Role.findById(user.role._id);
        if (!role || !role.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Role is invalid or inactive.'
            });
        }

        // console.log("role info: ", role);


        req.user = {
            userId: user._id.toString(),
            email: user.email,
            role: role.name,
            features: role.features
        };

        next();
    } catch (error) {
        console.log("Invalid token.", error);

        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

export const authorize = (requiredFeatures: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // get user info from jwt payload. payload name is user 
        const existUser = req.user;
        // console.log("existUser", existUser);


        if (!existUser) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        const hasAccess = requiredFeatures.every((feature) => {
            return existUser!.features.includes(feature)
        });
        // console.log("hasAccess", hasAccess);

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions to access this resource.'
            });
        }

        next();
    };
};


export const isSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'Super Admin') {
        return res.status(403).json({
            success: false,
            message: 'Super admin access required.'
        });
    }
    next();
};