
import prisma from '../lib/prisma';
import { approveRequest } from '../controllers/approval.controller';
import { RequestStatus } from '../types/request.interface';

// Mock Response
const mockRes = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.body = data;
        return res;
    };
    return res;
};

const mockNext = (err: any) => console.error('Next error:', err);

async function main() {
    console.log('--- Verifying Admin Approval of Drafts ---');

    // 1. Setup: Managerless Dept + Admin User
    const dept = await prisma.department.create({
        data: { name: `NoManager Dept ${Date.now()}`, code: `NM-${Date.now()}` } // No managerId
    });

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: `admin-${Date.now()}@example.com`,
            password: 'pwd',
            role: 'admin'
        }
    });

    const user = await prisma.user.create({
        data: {
            name: 'Requester',
            email: `req-${Date.now()}@example.com`,
            password: 'pwd',
            departmentId: dept.id
        }
    });

    // 2. Create a DRAFT request (Simulating the stuck request)
    const request = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: dept.id,
            title: 'Stuck Draft',
            resourceName: 'Thing',
            resourceType: 'Type',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.Draft // Explicitly Draft
        }
    });

    console.log(`Created Draft Request: ${request.id}`);

    // 3. Attempt Approval as Admin
    console.log('Attempting Approval as Admin...');
    const result = mockRes();

    // Mock req object with user (admin) and params
    await approveRequest({
        params: { requestId: request.id },
        body: { comment: 'Force Approve' },
        user: { ...admin, id: admin.id } // Ensure ID is present
    } as any, result, mockNext);

    if (result.statusCode === 200) {
        console.log('✅ APPROVED: Admin successfully approved the draft.');
    } else {
        console.log(`❌ FAILED: Status ${result.statusCode} - ${result.body?.message}`);
        if (result.body?.message?.includes('status is draft')) {
            console.log('   (Confirmed reproduction of issue)');
        }
    }

    // Cleanup
    await prisma.request.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, admin.id] } } });
    await prisma.department.delete({ where: { id: dept.id } });
}

main().catch(console.error);
