const { Client } = require('pg');

const connectionString = "postgresql://postgres.ukonmquqyrfrojcfiwok:Nati20409545@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // For testing only, use proper SSL in production
  }
});

async function testConnection() {
  try {
    console.log('🔄 Attempting to connect to the database...');
    await client.connect();
    console.log('✅ Successfully connected to the database');
    
    // Test a simple query
    const res = await client.query('SELECT $1::text as message', ['Database connection successful!']);
    console.log('📊 Query result:', res.rows[0].message);
    
    // Try to get database version
    const version = await client.query('SELECT version()');
    console.log('📋 Database version:', version.rows[0].version);
    
  } catch (err) {
    console.error('❌ Error connecting to the database');
    console.error('Error details:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

testConnection();
