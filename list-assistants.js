const prisma = require('./src/prisma');

async function list() {
    try {
        const assistants = await prisma.assistant.findMany();
        console.log('Current Assistants:', JSON.stringify(assistants, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('List failed:', err);
        process.exit(1);
    }
}

list();
