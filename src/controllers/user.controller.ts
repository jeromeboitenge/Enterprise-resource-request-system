import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { role, isActive, department } = req.query;
        const { page, limit, skip, take } = getPaginationParams(req.query);

        const filters = {
            role: role as string | undefined,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            department: department as string | undefined
        };

        const { users, total } = await UserService.getAllUsers(filters, { skip, take });

        const paginatedResponse = createPaginatedResponse(
            users,
            total,
            page,
            limit
        );

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: paginatedResponse
        });
    } catch (error) {
        next(error);
    }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await UserService.getUserById(req.params.id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password, role, isActive } = req.body;

        const emailExists = await UserService.checkEmailExists(email);

        if (emailExists) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }

        const user = await UserService.createUser({
            name,
            email,
            password,
            role,
            isActive
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: { user }
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('IT department not found')) {
            res.status(500).json({
                success: false,
                message: error.message
            });
            return;
        }
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, role, isActive } = req.body;

        if (email) {
            const emailExists = await UserService.checkEmailExists(email, req.params.id);
            if (emailExists) {
                res.status(409).json({
                    success: false,
                    message: 'Email is already in use'
                });
                return;
            }
        }

        const userExists = await UserService.getUserById(req.params.id);

        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const user = await UserService.updateUser(req.params.id, {
            name,
            email,
            role,
            isActive
        });

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userExists = await UserService.getUserById(req.params.id);

        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const user = await UserService.deleteUser(req.params.id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { newPassword } = req.body;

        const userExists = await UserService.getUserById(req.params.id);

        if (!userExists) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        const user = await UserService.resetPassword(req.params.id, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};
