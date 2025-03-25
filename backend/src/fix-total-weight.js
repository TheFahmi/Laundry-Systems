const { Client } = require('pg');
require('dotenv').config();

async function fixTotalWeightColumn() {
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

    // Check if the totalWeight column exists
    const camelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'totalWeight'
    `);

    // Check if total_weight exists (snake case version)
    const snakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'total_weight'
    `);

    if (camelCaseCheck.rows.length === 0 && snakeCaseCheck.rows.length === 0) {
      // Neither column exists, add the totalWeight column
      console.log('Adding totalWeight column to orders table...');
      await client.query(`ALTER TABLE orders ADD COLUMN "totalWeight" DECIMAL(10,2)`);
      console.log('Successfully added totalWeight column');
    } 
    else if (snakeCaseCheck.rows.length > 0 && camelCaseCheck.rows.length === 0) {
      // Only snake_case exists, rename it to camelCase
      console.log('Renaming total_weight to totalWeight in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "total_weight" TO "totalWeight"`);
      console.log('Successfully renamed total_weight to totalWeight');
    }
    else {
      console.log('totalWeight column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixTotalWeightColumn().catch(console.error); 