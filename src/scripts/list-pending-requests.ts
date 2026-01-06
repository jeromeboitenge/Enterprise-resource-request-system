import prisma from '../lib/prisma';

async function listPending() {
    const requests = await prisma.request.findMany({
        where: { status: 'submitted' },
        include: {
            user: { select: { name: true } },
            department: { select: { name: true } }
        }
    });

    console.log('--- Pending Requests (Status: Submitted) ---');
    if (requests.length === 0) {
        console.log('No pending requests found.');
    } else {
        requests.forEach(r => {
            console.log(`ID: ${r.id}`);
            console.log(`Title: ${r.title} | User: ${r.user.name} | Dept: ${r.department.name} | Status: ${r.status}`);
            console.log('------------------------------------------------');
        });
    }
}

listPending().catch(console.error).finally(async () => { await prisma.$disconnect(); });
