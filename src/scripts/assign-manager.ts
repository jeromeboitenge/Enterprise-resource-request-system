import prisma from '../lib/prisma';

async function assignManager() {
    // User 'manager' ID from previous step
    const managerUserId = 'd0b09af5-8de2-45df-a90b-e9241390b0ae';
    // Department 'Head Office' ID from previous step
    const departmentId = '30abd941-5a36-4618-8fc8-74957b49e6af';

    console.log(`Assigning user ${managerUserId} as manager of department ${departmentId}...`);

    const result = await prisma.department.update({
        where: { id: departmentId },
        data: { managerId: managerUserId }
    });

    console.log('Update successful:', result);
}

assignManager()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
