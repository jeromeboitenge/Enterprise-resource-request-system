
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    try {
        // Clean existing data
        await prisma.payment.deleteMany();
        await prisma.approval.deleteMany();
        await prisma.request.deleteMany();
        await prisma.notification.deleteMany(); // Added just in case
        await prisma.user.deleteMany();
        await prisma.department.deleteMany();

        console.log('✅ Cleared existing data');

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

        // Helper to get dept name - simplified for seeding since we just created them
        // But since IDs are auto-generated/uuid, we can't hardcode them easily without fetching.
        // However, the User model takes `department` as a String (name) based on my memory of the schema and previous controller code.
        // Let me double check validation/schema.
        // user.validation.ts and users.schema.ts are old.
        // prisma/schema.prisma: `department String`. Yes, it's just the name string, not a relation ID to Department model strictly enforcing FK on User table (unless I changed it).
        // Wait, let's allow myself to verify `prisma/schema.prisma` quickly if I am unsure about the User -> Department relation.
        // In `schema.prisma` I wrote:
        // model User { ... department String ... }
        // model Department { ... name String @unique ... }
        // There is NO foreign key relation defined in Prisma schema between User and Department (it was loose in Mongoose too).
        // So passing string 'IT' is fine.

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
