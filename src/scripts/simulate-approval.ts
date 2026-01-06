import prisma from '../lib/prisma';
import { RequestStatus } from '../types/request.interface';

async function verifyApproval() {
    const requestId = 'cf1c3f98-f9db-48df-b66f-5cb00486bccf';
    const managerId = 'd0b09af5-8de2-45df-a90b-e9241390b0ae'; // The user 'manager'

    console.log(`--- Verifying Approval for Request ${requestId} ---`);

    // 1. Fetch Request
    const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { department: true }
    });

    if (!request) {
        console.error('Request NOT FOUND in DB.');
        return;
    }
    console.log(`Request Found: Status=${request.status}, DeptID=${request.departmentId}`);

    // 2. Fetch Manager
    const manager = await prisma.user.findUnique({
        where: { id: managerId },
        include: { department: true }
    });

    if (!manager) {
        console.error('Manager NOT FOUND in DB.');
        return;
    }
    console.log(`Manager Found: Role=${manager.role}, DeptID=${manager.departmentId}`);

    // 3. Check Logic Match
    if (request.departmentId !== manager.departmentId) {
        console.error('MISMATCH: Request Dept !== Manager Dept');
    } else {
        console.log('MATCH: Manager belongs to Request Dept.');
    }

    // 4. Simulate Approval Update
    console.log('Simulating DB Update to ManagerApproved...');
    try {
        const updated = await prisma.request.update({
            where: { id: requestId },
            data: { status: RequestStatus.ManagerApproved }
        });
        console.log('SUCCESS: Updated status to:', updated.status);
    } catch (e) {
        console.error('UPDATE FAILED:', e);
    }
}

verifyApproval()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
