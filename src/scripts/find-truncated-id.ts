import prisma from '../lib/prisma';

async function findFullId() {
    const partialId = '92a63230-02bb-4103-a346-0fc106'; // The ID from user's screenshot
    console.log(`Searching for request starting with: ${partialId}...`);

    // Prisma doesn't support 'startsWith' on UUID fields typically, so we might need to fetch all or use raw query if strict.
    // But let's try to fetch all submitted requests and match in JS.
    const requests = await prisma.request.findMany({
        where: {
            status: { in: ['submitted', 'manager_approved'] }
        },
        select: { id: true, title: true, status: true }
    });

    const match = requests.find(r => r.id.startsWith(partialId));

    if (match) {
        console.log('FOUND FULL ID:', match.id);
        console.log('Title:', match.title);
        console.log('Status:', match.status);
    } else {
        console.log('No matching request found for that partial ID.');
        console.log('Listing all recent IDs for reference:');
        requests.slice(0, 5).forEach(r => console.log(`- ${r.id} (${r.title})`));
    }
}

findFullId()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
