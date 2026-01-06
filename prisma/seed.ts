
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log(' Starting database seeding...');

    try {
        // Clean existing data
        await prisma.payment.deleteMany();
        await prisma.approval.deleteMany();
        await prisma.request.deleteMany();
        await prisma.notification.deleteMany(); // Added just in case
        await prisma.user.deleteMany();
        await prisma.department.deleteMany();

        console.log(' Cleared existing data');

        // Create Departments
        const departmentsData = [
            { name: 'IT', description: 'Information Technology' },
            { name: 'HR', description: 'Human Resources' },
            { name: 'Finance', description: 'Finance Department' },
            { name: 'Operations', description: 'Operations' },
            { name: 'Marketing', description: 'Marketing Department' },
            { name: 'Sales', description: 'Sales Department' }
        ];

        console.log('Creating departments...');
        for (const dept of departmentsData) {
            await prisma.department.create({
                data: dept
            });
        }
        console.log('✅ Created departments');

        const hashedPassword = await bcrypt.hash('SecureP@ss123', 12);

        const usersData = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
                department: 'IT',
            },
            {
                name: 'Manager User',
                email: 'manager@example.com',
                role: 'manager',
                department: 'IT',
            },
            {
                name: 'Department Head',
                email: 'depthead@example.com',
                role: 'departmenthead',
                department: 'IT',
            },
            {
                name: 'Finance User',
                email: 'finance@example.com',
                role: 'finance',
                department: 'Finance',
            },
            {
                name: 'Employee User',
                email: 'employee@example.com',
                role: 'employee',
                department: 'IT',
            }
        ];

        console.log('Creating users...');
        for (const user of usersData) {
            await prisma.user.create({
                data: {
                    ...user,
                    password: hashedPassword,
                    isActive: true
                }
            });
        }

        console.log('\n✅ Created users:');
        usersData.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials (all users):');
        console.log('   Password: SecureP@ss123');
        console.log('\n   Emails:');
        usersData.forEach(user => console.log(`   - ${user.email}`));

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
