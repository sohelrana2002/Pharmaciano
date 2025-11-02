/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest, IRole, IUser } from '../types';
import { createUserValidator } from '../validators/authValidator';
// import { CreateUserRequest } from '../types';

// create user 
const createUser = async (req: AuthRequest, res: Response) => {
    try {
        // // Validate request body using Zod
        const validationResult = createUserValidator.safeParse(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.error.issues.map((err: { path: any[]; message: any; }) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }

        const { email, password, name, role: roleName } = validationResult.data;
        // const { email, password, name, role: roleName }: CreateUserRequest = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.'
            });
        }

        // Find role by name instead of ID
        const role = await Role.findOne({ name: roleName, isActive: true });

        // console.log("role", role);

        if (!role) {
            // Get available roles for better error message
            const availableRoles = await Role.find({ isActive: true }).select('name');
            console.log("availableRoles", availableRoles);

            return res.status(400).json({
                success: false,
                message: `Invalid role specified. Available roles: ${availableRoles.map(r => r.name).join(', ')}`
            });
        }

        const user = new User({
            email,
            password,
            name,
            role: role._id, // Use the role ID from the found role
            createdBy: req.user!.userId
        });

        await user.save();

        const savedUser = await User.findById(user._id)
            .populate<{ role: any }>('role', 'name description features')
            .select('-password');

        // console.log("savedUser", savedUser);

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: {
                user: {
                    id: savedUser!._id.toString(),
                    name: savedUser!.name,
                    role: savedUser!.role.name
                }
            }
        });
    } catch (error: any) {
        console.error('Create user error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};


// list of users 
const userList = async (req: AuthRequest, res: Response) => {
    try {
        const users = await User.find()
            .populate<{ role: IRole & { createdBy: IUser } }>({
                path: 'role',
                select: "-description",
                populate: {
                    path: 'createdBy',
                    select: 'name',
                },
            })
            .select('-password')
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            length: users.length,
            data: { users }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
};

export { createUser, userList }