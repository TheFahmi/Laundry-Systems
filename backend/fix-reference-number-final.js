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

async function fixReferenceNumberColumn() {
  // Display connection info for debugging (redacted password)
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

    // Run the SQL to fix reference_number column
    console.log('Updating NULL reference_number values...');
    
    // Check if reference_number column exists
    const columnCheckResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'payments' AND column_name = 'reference_number';
    `);
    
    if (columnCheckResult.rowCount === 0) {
      console.log('reference_number column does not exist in payments table');
      return;
    }
    
    // Count NULL values
    const nullCount = await client.query(`
      SELECT COUNT(*) AS count
      FROM payments
      WHERE reference_number IS NULL;
    `);
    
    console.log(`Found ${nullCount.rows[0].count} payments with NULL reference_number`);
    
    // Update NULL values with unique reference numbers
    if (parseInt(nullCount.rows[0].count) > 0) {
      const updateResult = await client.query(`
        UPDATE payments
        SET reference_number = CONCAT('REF-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
        WHERE reference_number IS NULL;
      `);
      
      console.log(`Updated ${updateResult.rowCount} payments with generated reference numbers`);
    }
    
    // Set default value
    console.log('Adding default constraint to reference_number column...');
    await client.query(`
      ALTER TABLE payments
      ALTER COLUMN reference_number SET DEFAULT 'REF-00000000-00000';
    `);
    
    // Set NOT NULL constraint
    console.log('Setting NOT NULL constraint on reference_number column...');
    await client.query(`
      ALTER TABLE payments
      ALTER COLUMN reference_number SET NOT NULL;
    `);
    
    console.log('Successfully fixed the reference_number column');
  } catch (error) {
    console.error('Error fixing reference_number column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixReferenceNumberColumn(); 