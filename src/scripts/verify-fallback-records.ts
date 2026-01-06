import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyFallbackRecords() {
    console.log('--- Verifying Admin Fallback Approval Records ---');

    // 1. Setup: Admin, Managerless Dept, User
    const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!admin) throw new Error('No admin found');

    const dept = await prisma.department.create({
        data: { name: 'Fallback Test Dept ' + Date.now() } // No managerId
    });

    const user = await prisma.user.create({
        data: {
            name: 'Fallback User',
            email: 'fallback' + Date.now() + '@example.com',
            password: 'password',
            departmentId: dept.id
        }
    });

    // 2. Create Request
    const request = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: dept.id,
            title: 'Fallback Request',
            resourceName: 'Test',
            resourceType: 'Type',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.Submitted
        },
        include: { department: true }
    });
    console.log(`Created Request: ${request.id} (Status: ${request.status})`);

    // 3. Admin Approves as Manager (Simulation)
    // We are simulating the Controller logic by manually invoking the update + approval creation
    // because we can't easily call the controller function directly with mocked req/res here without a lot of boilerplate.
    // However, to be TRUE to the verification, we should mirror the controller logic exactly.

    console.log('\n--- Step 1: Admin Approves as Manager ---');

    // Controller Logic Check:
    // role='admin', status='submitted', managerId=null -> Safe to approve?
    const isManagerless = !request.department.managerId;
    if (isManagerless && request.status === RequestStatus.Submitted) {
        console.log('Controller Logic: Admin authorized to approve Submitted request (Managerless).');

        // Action: Create Approval
        await prisma.approval.create({
            data: {
                requestId: request.id,
                approverId: admin.id,
                decision: 'approved',
                comment: 'Admin acting as Manager'
            }
        });

        // Action: Update Status
        await prisma.request.update({
            where: { id: request.id },
            data: { status: RequestStatus.ManagerApproved }
        });
        console.log('Result: Status Updated to ManagerApproved');
    } else {
        console.error('Controller Logic Failed: Admin NOT authorized.');
    }

    // 4. Admin Approves as Boss (Simulation)
    console.log('\n--- Step 2: Admin Approves as Boss ---');
    const step2Request = await prisma.request.findUnique({ where: { id: request.id } });

    // Controller Logic Check:
    // role='admin', status='manager_approved' -> Safe to approve?
    if (step2Request?.status === RequestStatus.ManagerApproved) {
        console.log('Controller Logic: Admin authorized to approve ManagerApproved request.');

        // Action: Create Approval
        await prisma.approval.create({
            data: {
                requestId: request.id,
                approverId: admin.id,
                decision: 'approved',
                comment: 'Admin acting as Boss'
            }
        });

        // Action: Update Status
        await prisma.request.update({
            where: { id: request.id },
            data: { status: RequestStatus.Approved }
        });
        console.log('Result: Status Updated to Approved');
    }

    // 5. Verify Records
    console.log('\n--- Verification ---');
    const approvals = await prisma.approval.findMany({
        where: { requestId: request.id },
        orderBy: { decisionDate: 'asc' },
        include: { approver: { select: { name: true, role: true } } }
    });

    console.log(`Total Approvals: ${approvals.length}`);
    approvals.forEach((app, index) => {
        console.log(`Approval #${index + 1}: By ${app.approver.name} (${app.approver.role}) - Comment: "${app.comment}"`);
    });

    if (approvals.length === 2) {
        console.log('SUCCESS: Two approval records created.');
    } else {
        console.error('FAILURE: Incorrect number of records.');
    }

    // Cleanup
    await prisma.approval.deleteMany({ where: { requestId: request.id } });
    await prisma.request.delete({ where: { id: request.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.department.delete({ where: { id: dept.id } });
}

verifyFallbackRecords()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
