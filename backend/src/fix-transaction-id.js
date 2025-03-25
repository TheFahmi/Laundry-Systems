const { Client } = require('pg');
require('dotenv').config();

async function fixTransactionIdColumn() {
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

    // Check if the transactionId column exists
    const camelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'transactionId'
    `);

    // Check if transaction_id exists (snake case version)
    const snakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'transaction_id'
    `);

    if (camelCaseCheck.rows.length === 0 && snakeCaseCheck.rows.length === 0) {
      // Neither column exists, add the transactionId column
      console.log('Adding transactionId column to payments table...');
      await client.query(`ALTER TABLE payments ADD COLUMN "transactionId" VARCHAR(255)`);
      console.log('Successfully added transactionId column');
    } 
    else if (snakeCaseCheck.rows.length > 0 && camelCaseCheck.rows.length === 0) {
      // Only snake_case exists, rename it to camelCase
      console.log('Renaming transaction_id to transactionId in payments table...');
      await client.query(`ALTER TABLE payments RENAME COLUMN "transaction_id" TO "transactionId"`);
      console.log('Successfully renamed transaction_id to transactionId');
    }
    else {
      console.log('transactionId column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixTransactionIdColumn().catch(console.error); 