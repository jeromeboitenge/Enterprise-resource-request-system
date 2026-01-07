
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
    console.log('--- Verifying Double Approval ---');

    // Setup
    const dept = await prisma.department.create({
        data: { name: `DA-Dept-${Date.now()}`, code: `DA-${Date.now()}` }
    });
    const user = await prisma.user.create({
        data: { name: 'User DA', email: `u-da-${Date.now()}@ex.com`, password: 'pwd', role: 'EMPLOYEE', departmentId: dept.id }
    });
    const manager = await prisma.user.create({
        data: { name: 'Mgr DA', email: `m-da-${Date.now()}@ex.com`, password: 'pwd', role: 'MANAGER', departmentId: dept.id }
    });
    const admin = await prisma.user.create({
        data: { name: 'Adm DA', email: `a-da-${Date.now()}@ex.com`, password: 'pwd', role: 'ADMIN' }
    });

    try {
        // Test 1: Manager Double Approval
        console.log('\n[Test 1] Manager Double Approval');
        const req1 = await prisma.request.create({
            data: {
                userId: user.id,
                departmentId: dept.id,
                title: 'Req 1',
                resourceName: 'R1',
                resourceType: 'T1',
                quantity: 1,
                estimatedCost: 100,
                status: RequestStatus.SUBMITTED
            }
        });

        // 1st Approval
        const resM1 = mockRes();
        await approveRequest({
            params: { requestId: req1.id },
            body: { comment: 'OK 1' },
            user: { ...manager, id: manager.id }
        } as any, resM1, mockNext);
        console.log(`M1 Result: ${resM1.statusCode}`); // Expect 200

        // 2nd Approval
        const resM2 = mockRes();
        await approveRequest({
            params: { requestId: req1.id },
            body: { comment: 'OK 2' },
            user: { ...manager, id: manager.id }
        } as any, resM2, mockNext);
        console.log(`M2 Result: ${resM2.statusCode} - ${resM2.body?.message}`); // Expect 400

        if (resM1.statusCode === 200 && resM2.statusCode === 400) {
            console.log('✅ Manager prevented from double approval.');
        } else {
            console.error('❌ Manager double approval check failed.');
        }

        // Test 2: Admin Double Approval (on Approved request)
        console.log('\n[Test 2] Admin Double Approval (Final State)');
        // First let Admin approve Req 1 (currently ManagerApproved)
        const resA1 = mockRes();
        await approveRequest({
            params: { requestId: req1.id },
            body: { comment: 'Adm OK' },
            user: { ...admin, id: admin.id }
        } as any, resA1, mockNext);
        console.log(`A1 Result: ${resA1.statusCode}`); // Expect 200 (Status -> Approved)

        // Try Admin again
        const resA2 = mockRes();
        await approveRequest({
            params: { requestId: req1.id },
            body: { comment: 'Adm OK 2' },
            user: { ...admin, id: admin.id }
        } as any, resA2, mockNext);
        console.log(`A2 Result: ${resA2.statusCode} - ${resA2.body?.message}`); // Expect 400

        if (resA1.statusCode === 200 && resA2.statusCode === 400) {
            console.log('✅ Admin prevented from double approving finalized request.');
        } else {
            console.error('❌ Admin final double approval check failed.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        // Cleanup
        await prisma.approval.deleteMany({ where: { approverId: { in: [manager.id, admin.id] } } });
        await prisma.request.deleteMany({ where: { userId: user.id } });
        await prisma.user.deleteMany({ where: { id: { in: [user.id, manager.id, admin.id] } } });
        await prisma.department.delete({ where: { id: dept.id } });
        await prisma.$disconnect();
    }
}

main();
