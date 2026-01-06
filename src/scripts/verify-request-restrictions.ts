
import prisma from '../lib/prisma';
import { updateRequest, deleteRequest } from '../controllers/request.controller';
import { RequestStatus } from '../types/request.interface';

// Mock Response object
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

// Mock Next function
const mockNext = (err: any) => {
    console.error('Next called with error:', err);
};

async function main() {
    console.log('--- Verifying Controller Logic ---');

    // 1. Setup
    const department = await prisma.department.create({
        data: { name: `Test Dept ${Date.now()}`, code: `TD-${Date.now()}` }
    });

    const user = await prisma.user.create({
        data: {
            name: 'Test Tester',
            email: `tester-${Date.now()}@example.com`,
            password: 'pwd',
            departmentId: department.id,
            role: 'employee'
        }
    });

    // 2. Test: Submitted Request (Update Description ONLY)
    const req1 = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: department.id,
            title: 'Submitted Item',
            resourceName: 'Mouse',
            resourceType: 'Eq',
            description: 'Old Desc',
            quantity: 5,
            estimatedCost: 50,
            status: RequestStatus.Submitted
        }
    });

    console.log('\n[Test 1] Updating Submitted Request (Optional Field: description)');
    const res1 = mockRes();
    await updateRequest({
        params: { id: req1.id },
        user: { id: user.id }, // Mock user
        body: { description: 'New Description', quantity: 999 } // Try to update quantity too
    } as any, res1, mockNext);

    if (res1.statusCode === 200 && res1.body.data.request.description === 'New Description' && res1.body.data.request.quantity === 5) {
        console.log('✅ PASSED: Description updated, Quantity ignored.');
    } else {
        console.error('❌ FAILED:', res1.statusCode, res1.body);
    }

    // 3. Test: Submitted Request (Update Forbidden Field ONLY)
    console.log('\n[Test 2] Updating Submitted Request (Forbidden Field Only)');
    const res2 = mockRes();
    await updateRequest({
        params: { id: req1.id },
        user: { id: user.id },
        body: { quantity: 999 }
    } as any, res2, mockNext);

    if (res2.statusCode === 400 && res2.body.message.includes('only the description')) {
        console.log('✅ PASSED: Update blocked when only forbidden fields provided.');
    } else {
        console.error('❌ FAILED:', res2.statusCode, res2.body);
    }

    // 4. Test: Manager Approved Request (Update Forbidden)
    const req2 = await prisma.request.create({
        data: {
            userId: user.id,
            departmentId: department.id,
            title: 'Approved Item',
            resourceName: 'Screen',
            resourceType: 'Eq',
            quantity: 1,
            estimatedCost: 100,
            status: RequestStatus.ManagerApproved
        }
    });

    console.log('\n[Test 3] Updating Manager Approved Request (Global Block)');
    const res3 = mockRes();
    await updateRequest({
        params: { id: req2.id },
        user: { id: user.id },
        body: { description: 'Sneaky Update' }
    } as any, res3, mockNext);

    if (res3.statusCode === 400 && res3.body.message.includes('Cannot update request')) {
        console.log('✅ PASSED: Update fully blocked for Approved request.');
    } else {
        console.error('❌ FAILED:', res3.statusCode, res3.body);
    }

    // 5. Test: Manager Approved Request (Delete Forbidden)
    console.log('\n[Test 4] Deleting Manager Approved Request');
    const res4 = mockRes();
    await deleteRequest({
        params: { id: req2.id },
        user: { id: user.id }
    } as any, res4, mockNext);

    if (res4.statusCode === 400 && res4.body.message.includes('Cannot delete request')) {
        console.log('✅ PASSED: Delete blocked for Approved request.');
    } else {
        console.error('❌ FAILED:', res4.statusCode, res4.body);
    }

    // Cleanup
    await prisma.request.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.department.delete({ where: { id: department.id } });
    console.log('\nCleanup complete.');
}

main().catch(console.error);
