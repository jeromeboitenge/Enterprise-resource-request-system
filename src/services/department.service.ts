import prisma from '../lib/prisma';

export class DepartmentService {

    static async getAllDepartments(pagination: { skip: number; take: number }) {
        const { skip, take } = pagination;

        const [departments, total] = await Promise.all([
            prisma.department.findMany({
                orderBy: { name: 'asc' },
                skip,
                take
            }),
            prisma.department.count()
        ]);

        return { departments, total };
    }

    static async getDepartmentById(id: string) {
        return await prisma.department.findUnique({
            where: { id }
        });
    }

    static async checkDepartmentExists(name: string, excludeId?: string) {
        const department = await prisma.department.findUnique({
            where: { name }
        });

        if (!department) return false;

        // If excludeId is provided, check if it's the same department (for updates)
        if (excludeId && department.id === excludeId) {
            return false;
        }

        return true;
    }

    static async createDepartment(data: {
        name: string;
        description?: string;
    }, managerId: string) {
        // Create department
        const department = await prisma.department.create({
            data: {
                name: data.name,
                description: data.description
            }
        });

        // Assign the creating user as a manager through the DepartmentManager junction table
        await prisma.departmentManager.create({
            data: {
                userId: managerId,
                departmentId: department.id
            }
        });

        return department;
    }

    static async updateDepartment(id: string, data: {
        name?: string;
        description?: string;
    }) {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;

        return await prisma.department.update({
            where: { id },
            data: updateData
        });
    }

    static async deleteDepartment(id: string) {
        return await prisma.department.delete({
            where: { id }
        });
    }
}
