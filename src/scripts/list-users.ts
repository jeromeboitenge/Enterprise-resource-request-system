import prisma from '../lib/prisma';

async function listUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: { select: { name: true } }
        }
    });

    console.log('--- Users ---');
    users.forEach(user => {
        console.log(`Name: ${user.name} | Role: ${user.role} | Dept: ${user.department?.name || 'None'} | ID: ${user.id}`);
    });
}

listUsers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
