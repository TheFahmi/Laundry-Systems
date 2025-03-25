const { Client } = require('pg');
require('dotenv').config();

async function fixReferenceNumberColumn() {
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

    // Check if the referenceNumber column exists
    const camelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'referenceNumber'
    `);

    // Check if reference_number exists (snake case version)
    const snakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'reference_number'
    `);

    if (camelCaseCheck.rows.length === 0 && snakeCaseCheck.rows.length === 0) {
      // Neither column exists, add the referenceNumber column
      console.log('Adding referenceNumber column to payments table...');
      await client.query(`ALTER TABLE payments ADD COLUMN "referenceNumber" VARCHAR(255)`);
      console.log('Successfully added referenceNumber column');
    } 
    else if (snakeCaseCheck.rows.length > 0 && camelCaseCheck.rows.length === 0) {
      // Only snake_case exists, rename it to camelCase
      console.log('Renaming reference_number to referenceNumber in payments table...');
      await client.query(`ALTER TABLE payments RENAME COLUMN "reference_number" TO "referenceNumber"`);
      console.log('Successfully renamed reference_number to referenceNumber');
    }
    else {
      console.log('referenceNumber column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixReferenceNumberColumn().catch(console.error); 