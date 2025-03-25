const { Client } = require('pg');
require('dotenv').config();

async function fixTotalAmountColumn() {
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

    // Check if the totalAmount column exists
    const camelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'totalAmount'
    `);

    // Check if total_amount exists (snake case version)
    const snakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'total_amount'
    `);

    if (camelCaseCheck.rows.length === 0 && snakeCaseCheck.rows.length === 0) {
      // Neither column exists, add the totalAmount column
      console.log('Adding totalAmount column to orders table...');
      await client.query(`ALTER TABLE orders ADD COLUMN "totalAmount" DECIMAL(10,2)`);
      console.log('Successfully added totalAmount column');
    } 
    else if (snakeCaseCheck.rows.length > 0 && camelCaseCheck.rows.length === 0) {
      // Only snake_case exists, rename it to camelCase
      console.log('Renaming total_amount to totalAmount in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "total_amount" TO "totalAmount"`);
      console.log('Successfully renamed total_amount to totalAmount');
    }
    else {
      console.log('totalAmount column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixTotalAmountColumn().catch(console.error); 