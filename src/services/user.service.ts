import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

export class UserService {

    static async getAllUsers(
        filters: {
            role?: string;
            isActive?: boolean;
            department?: string;
        },
        pagination: { skip: number; take: number }
    ) {
        const { skip, take } = pagination;
        const filter: any = {};

        if (filters.role) {
            filter.role = filters.role;
        }

        if (filters.isActive !== undefined) {
            filter.isActive = filters.isActive;
        }

        if (filters.department) {
            filter.department = filters.department;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: filter,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    departmentId: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where: filter })
        ]);

        return { users, total };
    }

    static async getUserById(id: string) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                departmentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true
            }
        });
    }

    static async checkEmailExists(email: string, excludeId?: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) return false;

        // If excludeId is provided, check if it's the same user (for updates)
        if (excludeId && user.id === excludeId) {
            return false;
        }

        return true;
    }

    static async getITDepartment() {
        return await prisma.department.findFirst({
            where: { name: 'IT' }
        });
    }

    static async createUser(data: {
        name: string;
        email: string;
        password: string;
        role?: string;
        isActive?: boolean;
    }) {
        // Get IT department (must exist)
        const itDepartment = await this.getITDepartment();

        if (!itDepartment) {
            throw new Error('IT department not found. Please contact administrator.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: (data.role || 'EMPLOYEE') as any,
                departmentId: itDepartment.id,
                isActive: data.isActive !== undefined ? data.isActive : true
            }
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async updateUser(id: string, data: {
        name?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
    }) {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async deleteUser(id: string) {
        const user = await prisma.user.delete({
            where: { id }
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    static async resetPassword(id: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const user = await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
