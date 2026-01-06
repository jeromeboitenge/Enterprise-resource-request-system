import prisma from '../lib/prisma';

async function checkRequest() {
    const requestId = 'f0b34050-e003-41db-8219-486663'; // Partial ID from screenshot
    // Need full ID? Let's search by prefix again just in case, or try finding unique if user provided full in text? 
    // Screenshot shows partial in URL... wait, screenshot shows: .../approval/f0b34050-e003-41db-8219-486663... 
    // It's cut off. I need to find the full ID first.

    console.log(`Searching for request starting with: ${requestId}...`);
    const requests = await prisma.request.findMany({
        where: { status: 'submitted' },
        select: { id: true, status: true, department: { select: { name: true, managerId: true } } }
    });

    // The user provided text: "f0b34050-e003-41db-8219-486663" in input. Let's assume that's the prefix.
    const match = requests.find(r => r.id.startsWith(requestId));

    if (match) {
        console.log('Request Found:', match.id);
        console.log('Status:', match.status);
        console.log('Department:', match.department.name);
        console.log('Manager ID:', match.department.managerId);
    } else {
        console.log('Request NOT found.');
    }
}

checkRequest().catch(console.error).finally(async () => { await prisma.$disconnect(); });
