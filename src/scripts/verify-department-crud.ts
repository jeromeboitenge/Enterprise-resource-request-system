
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDepartmentUpdate() {
    console.log('Starting Department Verification...');
    const timestamp = Date.now();
    const testDeptName = `DeptTest_${timestamp}`;
    const newDeptName = `DeptNew_${timestamp}`;

    try {
        console.log('1. Creating department...');
        console.log('1. Creating department...');
        const dept = await prisma.department.create({
            data: {
                name: testDeptName,
                description: 'Original Description'
            }
        });
        console.log('Department created:', dept.id);



        console.log('2. Updating Description ONLY (Name Optional Check)...');

        const reqBody1 = { description: 'Updated Description' };

        const updateData1: any = {};
        if ((reqBody1 as any).name) updateData1.name = (reqBody1 as any).name;
        if (reqBody1.description) updateData1.description = reqBody1.description;

        const updatedDept1 = await prisma.department.update({
            where: { id: dept.id },
            data: updateData1
        });

        if (updatedDept1.name !== testDeptName) throw new Error('Name changed unexpectedly!');
        if (updatedDept1.description !== 'Updated Description') throw new Error('Description failed to update');
        console.log('Success: Name preserved, description updated.');

        console.log('3. Updating Name...');
        console.log('3. Updating Name...');
        const reqBody2 = { name: newDeptName };

        const updateData2: any = {};
        if (reqBody2.name) updateData2.name = reqBody2.name;

        const updatedDept2 = await prisma.department.update({
            where: { id: dept.id },
            data: updateData2
        });

        if (updatedDept2.name !== newDeptName) throw new Error('Name failed to update');
        console.log('Success: Name updated.');

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {

        const cleanup = await prisma.department.findMany({
            where: {
                OR: [
                    { name: { startsWith: 'DeptTest_' } },
                    { name: { startsWith: 'DeptNew_' } }
                ]
            }
        });

        for (const d of cleanup) {
            await prisma.department.delete({ where: { id: d.id } });
        }
        await prisma.$disconnect();
    }
}

verifyDepartmentUpdate();
