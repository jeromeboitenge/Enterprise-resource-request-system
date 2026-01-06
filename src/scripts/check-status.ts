import prisma from '../lib/prisma';

async function checkStatus() {
    const requestId = 'f0b34050-e003-41db-8219-486663ee2245'; // Full ID from previous step
    console.log(`Checking status for: ${requestId}`);

    const request = await prisma.request.findUnique({
        where: { id: requestId },
        include: { department: true }
    });

    if (request) {
        console.log(`Current Status: ${request.status}`);
        console.log(`Department: ${request.department.name}`);
        if (request.status === 'manager_approved') {
            console.log('SUCCESS: Request is waiting for Admin approval.');
        } else {
            console.log('State is not manager_approved.');
        }
    } else {
        console.log('Request not found.');
    }
}

checkStatus().catch(console.error).finally(async () => { await prisma.$disconnect(); });
