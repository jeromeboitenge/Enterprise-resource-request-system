import prisma from '../lib/prisma';

/**
 * Check for NULL foreign key values before migration
 */
async function checkNullForeignKeys() {
    console.log('🔍 Checking for NULL foreign key values...\n');

    // Check users without departments
    const usersWithoutDept = await prisma.user.count({
        where: { departmentId: null }
    });

    console.log(`Users without department: ${usersWithoutDept}`);

    // Check departments without managers
    const deptsWithoutManager = await prisma.department.count({
        where: { managerId: null }
    });

    console.log(`Departments without manager: ${deptsWithoutManager}\n`);

    if (usersWithoutDept > 0 || deptsWithoutManager > 0) {
        console.log('⚠️  NULL values found! Migration strategy needed.\n');

        // List users without departments
        if (usersWithoutDept > 0) {
            const users = await prisma.user.findMany({
                where: { departmentId: null },
                select: { id: true, name: true, email: true, role: true }
            });
            console.log('Users without department:');
            console.table(users);
        }

        // List departments without managers
        if (deptsWithoutManager > 0) {
            const depts = await prisma.department.findMany({
                where: { managerId: null },
                select: { id: true, name: true, code: true }
            });
            console.log('\nDepartments without manager:');
            console.table(depts);
        }

        return false;
    }

    console.log('✅ No NULL foreign keys found. Safe to proceed with migration.\n');
    return true;
}

/**
 * Create default department and assign NULL values
 */
async function migrateNullValues() {
    console.log('🔄 Starting NULL value migration...\n');

    // Find or create an admin user
    let admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        console.log('❌ No admin user found. Please create an admin user first.');
        return false;
    }

    console.log(`✅ Found admin: ${admin.name} (${admin.email})\n`);

    // Find or create default department
    let defaultDept = await prisma.department.findFirst({
        where: { name: 'Unassigned' }
    });

    if (!defaultDept) {
        console.log('Creating default "Unassigned" department...');
        defaultDept = await prisma.department.create({
            data: {
                name: 'Unassigned',
                code: 'UNASSIGNED',
                description: 'Default department for users without assigned department',
                managerId: admin.id
            }
        });
        console.log(`✅ Created department: ${defaultDept.name}\n`);
    } else {
        // Update manager if null
        if (!defaultDept.managerId) {
            await prisma.department.update({
                where: { id: defaultDept.id },
                data: { managerId: admin.id }
            });
            console.log(`✅ Updated "Unassigned" department manager\n`);
        }
    }

    // Assign users without department to default department
    const usersUpdated = await prisma.user.updateMany({
        where: { departmentId: null },
        data: { departmentId: defaultDept.id }
    });

    console.log(`✅ Assigned ${usersUpdated.count} users to default department\n`);

    // Assign departments without manager to admin
    const deptsUpdated = await prisma.department.updateMany({
        where: { managerId: null },
        data: { managerId: admin.id }
    });

    console.log(`✅ Assigned ${deptsUpdated.count} departments to admin manager\n`);

    console.log('✅ Migration complete!\n');
    return true;
}

/**
 * Main execution
 */
async function main() {
    try {
        const isSafe = await checkNullForeignKeys();

        if (!isSafe) {
            console.log('Running migration to fix NULL values...\n');
            const success = await migrateNullValues();

            if (success) {
                console.log('Verifying migration...\n');
                await checkNullForeignKeys();
            }
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
