const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found, using default environment variables');
  dotenv.config();
}

async function checkColumnCase() {
  console.log(`Connecting to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE} as ${process.env.DB_USERNAME}`);
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check raw column names directly from pg_attribute for the orders table
    console.log('\n--- Checking exact column names in "orders" table ---');
    
    const pgAttributeQuery = `
      SELECT attname
      FROM pg_attribute
      WHERE attrelid = 'orders'::regclass
        AND attnum > 0
        AND NOT attisdropped
      ORDER BY attnum;
    `;
    
    const result = await client.query(pgAttributeQuery);
    
    // Display all column names with exact case
    console.log('Column names in orders table (with exact case):');
    result.rows.forEach(row => {
      console.log(`- ${row.attname}`);
    });
    
    // Check if there's both "order_number" and "orderNumber"
    const hasOrderNumber = result.rows.some(row => row.attname === 'order_number');
    const hasOrderNumberCamelCase = result.rows.some(row => row.attname === 'orderNumber');
    
    console.log(`\nHas "order_number" column: ${hasOrderNumber}`);
    console.log(`Has "orderNumber" column: ${hasOrderNumberCamelCase}`);
    
  } catch (error) {
    console.error('Error checking column case:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkColumnCase(); 