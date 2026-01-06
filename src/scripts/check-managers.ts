import prisma from '../lib/prisma';

async function checkManagers() {
    const departments = await prisma.department.findMany({
        include: {
            manager: true
        }
    });

    console.log('--- Departments and Managers ---');
    departments.forEach(dept => {
        console.log(`Department: ${dept.name} (ID: ${dept.id})`);
        console.log(`Manager: ${dept.manager ? dept.manager.name : 'NONE'} (ID: ${dept.managerId})`);
        console.log('--------------------------------');
    });
}

checkManagers()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
