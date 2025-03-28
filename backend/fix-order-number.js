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

async function fixOrderNumberColumn() {
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

    // Run the SQL to fix order_number column
    console.log('Updating NULL order_number values...');
    
    // Check if order_number column exists
    const columnCheckResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'order_number';
    `);
    
    if (columnCheckResult.rowCount === 0) {
      console.log('order_number column does not exist in orders table');
      return;
    }
    
    // Count NULL values
    const nullCount = await client.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE order_number IS NULL;
    `);
    
    console.log(`Found ${nullCount.rows[0].count} orders with NULL order_number`);
    
    // Update NULL values with unique order numbers
    if (parseInt(nullCount.rows[0].count) > 0) {
      const updateResult = await client.query(`
        UPDATE orders
        SET order_number = CONCAT('ORD-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
        WHERE order_number IS NULL;
      `);
      
      console.log(`Updated ${updateResult.rowCount} orders with generated order numbers`);
    }
    
    // Set default value
    console.log('Adding default constraint to order_number column...');
    await client.query(`
      ALTER TABLE orders
      ALTER COLUMN order_number SET DEFAULT 'ORD-00000000-00000';
    `);
    
    // Set NOT NULL constraint
    console.log('Setting NOT NULL constraint on order_number column...');
    await client.query(`
      ALTER TABLE orders
      ALTER COLUMN order_number SET NOT NULL;
    `);
    
    console.log('Successfully fixed the order_number column');
  } catch (error) {
    console.error('Error fixing order_number column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixOrderNumberColumn(); 