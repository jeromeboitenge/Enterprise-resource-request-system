import mongoose from 'mongoose';
import Department from '../model/department';
import 'dotenv/config';

async function seedDepartments() {
    try {
        let dbUrl = process.env.DB_URL as string;
        const dbUsername = process.env.DB_USERNAME as string;
        const dbPassword = process.env.DB_PASSWORD as string;

        dbUrl = dbUrl
            .replace('<db_username>', dbUsername)
            .replace('<db_password>', dbPassword);

        await mongoose.connect(dbUrl);
        console.log('✅ Connected to MongoDB');

        const departments = [
            { name: 'IT', description: 'Information Technology Department' },
            { name: 'HR', description: 'Human Resources Department' },
            { name: 'Finance', description: 'Finance Department' },
            { name: 'Operations', description: 'Operations Department' },
            { name: 'Marketing', description: 'Marketing Department' },
            { name: 'Sales', description: 'Sales Department' }
        ];

        for (const dept of departments) {
            const existingDept = await Department.findOne({ name: dept.name });
            if (!existingDept) {
                await Department.create(dept);
                console.log(`Created department: ${dept.name}`);
            } else {
                console.log(` Department already exists: ${dept.name}`);
            }
        }

        console.log('\Department seeding completed successfully!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Department seeding failed:', error);
        process.exit(1);
    }
}

seedDepartments();
