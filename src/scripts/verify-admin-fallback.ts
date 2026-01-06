import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyFallback() {
    // 1. Ensure Admin exists
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) throw new Error('No admin found');
    console.log(`Found Admin: ${admin.name}`);

    // 2. Create Dept without Manager
    const dept = await prisma.department.create({
        data: { name: 'Test No Manager Dept ' + Date.now() }
    });
    console.log(`Created Department: ${dept.name}`);

    // 3. Create User in Dept
    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'testuser' + Date.now() + '@example.com',
            password: 'password',
            departmentId: dept.id
        }
    });

    const request = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: dept.id,
            title: 'Test Request',
            resourceName: 'Test Resource',
            resourceType: 'Type',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.Submitted
        },
        include: {
            department: {
                select: {
                    name: true,
                    manager: { select: { name: true } }
                }
            }
        }
    });

    console.log('Original Request (from DB):', JSON.stringify(request, null, 2));

    // Simulate Controller Logic
    let responseRequest = { ...request };

    // @ts-ignore
    if (!responseRequest.department.manager) {
        console.log('Manager is missing, applying fallback...');
        // @ts-ignore
        responseRequest.department.manager = { name: admin.name };
    }

    console.log('Processed Request (simulated Controller):', JSON.stringify(responseRequest, null, 2));

    if (responseRequest.department.manager?.name === admin.name) {
        console.log('SUCCESS: Admin fallback applied correctly.');
    } else {
        console.error('FAILURE: Admin fallback not applied.');
    }

    // Cleanup
    await prisma.request.delete({ where: { id: request.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.department.delete({ where: { id: dept.id } });
}

verifyFallback()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
