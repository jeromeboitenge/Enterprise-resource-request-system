
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function verifyUserUpdate() {
    console.log('Starting verification...');

    const testEmail = `test_${uuidv4()}@example.com`;
    const testDeptName = `Dept_${uuidv4()}`;

    try {
        // 1. Create a user without a department
        console.log('1. Creating user...');
        const user = await prisma.user.create({
            data: {
                name: 'Test User',
                email: testEmail,
                password: 'hashed_password_placeholder',
                role: 'employee'
            }
        });
        console.log('User created:', user.id);

        // 2. Create a department separately
        console.log('2. Creating department...');
        const dept = await prisma.department.create({
            data: {
                name: testDeptName,
                description: 'Test Department'
            }
        });
        console.log('Department created:', dept.id);

        // 3. Simulate Updating the user with department name (as strings passed from controller)
        // NOTE: The controller logic we are fixing receives { department: "name" } in req.body
        // We will simulate what the controller SHOULD do vs what it DOES.

        // FLAWED LOGIC SIMULATION (Current Controller Code)
        // The current controller tries:
        // const user = await prisma.user.update({
        //     where: { id: req.params.id },
        //     data: { department: "DeptName" } // This THROWS because 'department' is a relation
        // });

        // We actually want to verifying the CONTROLLER'S behavior, but we can't easily invoke the controller function directly without mocking Express req/res.
        // Instead, I will write the CORRECT logic I intend to implement and verify it works with Prisma.

        console.log('3. Updating user with department name...');

        // Logic to implement: Find Dept first
        const foundDept = await prisma.department.findUnique({
            where: { name: testDeptName }
        });

        if (!foundDept) throw new Error('Department not found logic failed');

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                department: {
                    connect: { id: foundDept.id }
                }
            },
            include: { department: true }
        });

        if (updatedUser.department?.name !== testDeptName) {
            throw new Error('Department update failed!');
        }
        console.log('User updated with department:', updatedUser.department?.name);

        // 4. Update user WITHOUT department (Optionality check)
        console.log('4. Updating user without department (should remain unchanged)...');
        const updatedUser2 = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: 'Test User Updated'
                // department is undefined/omitted
            },
            include: { department: true }
        });

        if (updatedUser2.name !== 'Test User Updated') throw new Error('Name update failed');
        if (updatedUser2.department?.name !== testDeptName) throw new Error('Department was cleared or changed unexpectedly!');
        console.log('User updated (name only), department persisted:', updatedUser2.department?.name);

        console.log('SUCCESS: All checks passed.');

    } catch (error) {
        console.error('FAILED:', error);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            const u = await prisma.user.findUnique({ where: { email: testEmail } });
            if (u) await prisma.user.delete({ where: { id: u.id } });

            const d = await prisma.department.findUnique({ where: { name: testDeptName } });
            if (d) await prisma.department.delete({ where: { id: d.id } });
        } catch (e) {
            console.error('Cleanup failed:', e);
        }
        await prisma.$disconnect();
    }
}

verifyUserUpdate();
