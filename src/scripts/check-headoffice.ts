import prisma from '../lib/prisma';

async function checkHeadOffice() {
    const dept = await prisma.department.findUnique({
        where: { id: '30abd941-5a36-4618-8fc8-74957b49e6af' }, // Head Office ID from history
        include: { manager: true }
    });

    if (!dept) {
        // Try searching by name if ID changed (e.g. DB reset)
        const deptByName = await prisma.department.findFirst({
            where: { name: 'Head Office' },
            include: { manager: true }
        });

        if (!deptByName) {
            console.log('Department "Head Office" NOT FOUND.');
            return;
        }
        console.log('Department found by NAME:', deptByName.name);
        console.log('ID:', deptByName.id);
        console.log('Manager:', deptByName.manager ? deptByName.manager.name : 'NULL');
        return;
    }

    console.log('Department found by ID:', dept.name);
    console.log('Manager:', dept.manager ? dept.manager.name : 'NULL');
    console.log('Manager ID:', dept.managerId);
}

checkHeadOffice()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
