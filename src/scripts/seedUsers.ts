import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../model/user';
import Department from '../model/department';
import 'dotenv/config';

async function seedDatabase() {
    try {

        let dbUrl = process.env.DB_URL as string;
        const dbUsername = process.env.DB_USERNAME as string;
        const dbPassword = process.env.DB_PASSWORD as string;

        dbUrl = dbUrl
            .replace('<db_username>', dbUsername)
            .replace('<db_password>', dbPassword);

        await mongoose.connect(dbUrl);
        console.log('✅ Connected to MongoDB');

        await User.deleteMany({});
        await Department.deleteMany({});
        console.log('✅ Cleared existing data');

        const departments = await Department.create([
            { name: 'IT', code: 'IT', description: 'Information Technology' },
            { name: 'HR', code: 'HR', description: 'Human Resources' },
            { name: 'Finance', code: 'FIN', description: 'Finance Department' },
            { name: 'Operations', code: 'OPS', description: 'Operations' }
        ]);
        console.log('✅ Created departments');

        const hashedPassword = await bcrypt.hash('SecureP@ss123', 12);

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                department: 'IT',
                isActive: true
            },
            {
                name: 'Manager User',
                email: 'manager@example.com',
                password: hashedPassword,
                role: 'manager',
                department: 'IT',
                isActive: true
            },
            {
                name: 'Department Head',
                email: 'depthead@example.com',
                password: hashedPassword,
                role: 'departmenthead',
                department: 'IT',
                isActive: true
            },
            {
                name: 'Finance User',
                email: 'finance@example.com',
                password: hashedPassword,
                role: 'finance',
                department: 'Finance',
                isActive: true
            },
            {
                name: 'Employee User',
                email: 'employee@example.com',
                password: hashedPassword,
                role: 'employee',
                department: 'IT',
                isActive: true
            }
        ]);

        console.log('\n✅ Created users:');
        users.forEach(user => {
            console.log(`   - ${user.email} (${user.role})`);
        });

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Login credentials (all users):');
        console.log('   Password: SecureP@ss123');
        console.log('\n   Emails:');
        console.log('   - admin@example.com');
        console.log('   - manager@example.com');
        console.log('   - depthead@example.com');
        console.log('   - finance@example.com');
        console.log('   - employee@example.com');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDatabase();
