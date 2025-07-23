import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Successfully executed test query:', result);
    
    // Try to get the first user (if any)
    try {
      const users = await prisma.user.findMany({ take: 1 });
      console.log('✅ Successfully queried users table. Found', users.length, 'users');
    } catch (error) {
      console.warn('⚠ Could not query users table. This might be expected if the table does not exist yet.');
      console.warn('Error details:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to the database');
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .catch((e) => {
    console.error('❌ Error in testConnection:', e);
    process.exit(1);
  });
