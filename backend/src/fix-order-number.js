const { Client } = require('pg');
require('dotenv').config();

async function fixOrderNumberColumn() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the orderNumber column exists
    const camelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'orderNumber'
    `);

    // Check if order_number exists (snake case version)
    const snakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'order_number'
    `);

    if (camelCaseCheck.rows.length === 0 && snakeCaseCheck.rows.length === 0) {
      // Neither column exists, add the orderNumber column
      console.log('Adding orderNumber column to orders table...');
      await client.query(`ALTER TABLE orders ADD COLUMN "orderNumber" VARCHAR(50) UNIQUE`);
      console.log('Successfully added orderNumber column');
    } 
    else if (snakeCaseCheck.rows.length > 0 && camelCaseCheck.rows.length === 0) {
      // Only snake_case exists, rename it to camelCase
      console.log('Renaming order_number to orderNumber in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "order_number" TO "orderNumber"`);
      console.log('Successfully renamed order_number to orderNumber');
    }
    else {
      console.log('orderNumber column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixOrderNumberColumn().catch(console.error); 