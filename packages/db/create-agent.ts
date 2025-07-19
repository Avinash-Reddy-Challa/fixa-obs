
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const agent = await prisma.agent.create({
      data: {
        id: 'agent-1',
        name: 'Test Agent',
        ownerId: 'dev-org-id',
        customerAgentId: 'agent-1',
        phoneNumber: '+1234567890',
        updatedAt: new Date()
      }
    });
    console.log('Agent created:', agent);
  } catch (e) {
    console.error('Error creating agent:', e);
  } finally {
    await prisma.();
  }
}

main();

