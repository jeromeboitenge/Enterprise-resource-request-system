import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyCreateLogic() {
    console.log('--- Simulating Request Creation in Head Office ---');

    // 1. Get Head Office Dept ID
    const deptId = '30abd941-5a36-4618-8fc8-74957b49e6af';

    // 2. Create Request (using include from Controller)
    // We need a dummy user in Head Office
    const user = await prisma.user.findFirst({ where: { departmentId: deptId, role: 'employee' } });
    if (!user) {
        console.error('No employee found in Head Office to create request.');
        return;
    }
    console.log(`Using User: ${user.name}`);

    const request = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: deptId,
            title: 'Test Create Logic',
            resourceName: 'Test',
            resourceType: 'Type',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.Submitted
        },
        include: {
            department: {
                select: {
                    name: true,
                    code: true,
                    manager: { select: { name: true } }
                }
            }
        }
    });

    console.log('--- Result from DB ---');
    console.log('Department:', request.department.name);
    // @ts-ignore
    console.log('Manager Object:', request.department.manager);

    // Simulate Controller Fallback Logic
    let finalManagerName = 'Unknown';
    // @ts-ignore
    if (!request.department.manager) {
        console.log('Fallback Triggered!');
        const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
        finalManagerName = admin?.name || 'Admin';
    } else {
        // @ts-ignore
        finalManagerName = request.department.manager.name;
    }

    console.log(`FINAL Manager Name in Response: ${finalManagerName}`);

    // Cleanup
    await prisma.request.delete({ where: { id: request.id } });
}

verifyCreateLogic()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
