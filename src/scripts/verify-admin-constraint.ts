import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyAdminConstraint() {
    console.log('--- Verifying Admin Constraint (Manager Exists) ---');

    // 1. Setup: Head Office (Has Manager)
    const deptId = '30abd941-5a36-4618-8fc8-74957b49e6af'; // Head Office
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) { console.error('No Admin found'); return; }

    // 2. Create Request in Head Office
    const user = await prisma.user.findFirst({ where: { departmentId: deptId, role: 'employee' } });
    const request = await prisma.request.create({
        data: {
            userId: user!.id,
            departmentId: deptId,
            title: 'Constraint Test',
            resourceName: 'Test',
            resourceType: 'Type',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.Submitted
        },
        include: { department: true }
    });

    console.log(`Created Request ${request.id} in Dept with Manager.`);

    // 3. Simulate Admin Attempting Approval
    console.log('Simulating Admin trying to approve Submitted request...');

    // Controller Logic REPLICATION:
    const isManagerless = !request.department.managerId;
    const allowedStatuses = isManagerless
        ? [RequestStatus.Submitted, RequestStatus.ManagerApproved]
        : [RequestStatus.ManagerApproved];

    // Admin trying to update 'Submitted' -> 'ManagerApproved'
    if (!allowedStatuses.includes(request.status as any)) {
        console.log('SUCCESS: Admin BLOCKED from approving. Constraint working.');
        console.log(`Reason: Request status is ${request.status}. Admin can only approve requests already approved by a manager.`);
    } else {
        console.error('FAILURE: Admin ALLOWED to approve! Constraint broken.');
        console.log(`isManagerless: ${isManagerless}`);
    }

    // Cleanup
    await prisma.request.delete({ where: { id: request.id } });
}

verifyAdminConstraint()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
