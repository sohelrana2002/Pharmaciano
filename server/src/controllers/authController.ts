/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Role from '../models/Role';

// Define the User type with comparePassword method
interface UserWithMethods {
  _id: any;
  email: string;
  name: string;
  isActive: boolean;
  role: any;
  comparePassword(password: string): Promise<boolean>;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    features: string[];
  };
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email, isActive: true })
      .populate<{ role: any }>('role') as unknown as (UserWithMethods & { role: any }) | null;

    // console.log("user info", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    const role = await Role.findById(user.role._id);
    if (!role || !role.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User role is invalid or inactive.'
      });
    }

    // console.log("Role info", role);


    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: role.name,
        features: role.features
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: role.name,
          features: role.features
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await User.findById(userId)
      .populate<{ role: any }>('role')
      .select('-password') as unknown as (UserWithMethods & { role: any }) | null;

    // console.log("user", user);


    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const role = await Role.findById(user.role._id)
      .populate<{ createdBy: any }>({
        path: "createdBy",
        select: "-password"
      });

    // console.log("role info:", role);


    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: role.name,
          features: role.features,
          createdBy: role.createdBy.name,
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};