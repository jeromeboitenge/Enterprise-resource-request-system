
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
    try {
        await prisma.$connect();
        console.log('✅ Connection Successful!');
        const users = await prisma.user.count();
        console.log(`Current user count: ${users}`);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
