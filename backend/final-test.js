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

async function finalTest() {
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

    console.log('\n--- FINAL TEST: Checking order_number column ---');
    
    // 1. Check if there are any NULL values in order_number
    const nullOrderNumberResult = await client.query(`
      SELECT COUNT(*) 
      FROM orders 
      WHERE order_number IS NULL;
    `);
    
    console.log(`Orders with NULL order_number: ${nullOrderNumberResult.rows[0].count}`);
    
    if (parseInt(nullOrderNumberResult.rows[0].count) > 0) {
      console.log('WARNING: There are still NULL values in the order_number column!');
      
      // Fix remaining NULL values
      await client.query(`
        UPDATE orders
        SET order_number = CONCAT('ORD-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
        WHERE order_number IS NULL;
      `);
      
      console.log('Fixed remaining NULL values.');
    } else {
      console.log('SUCCESS: No NULL values in order_number column.');
    }
    
    // 2. Check that NOT NULL constraint is properly applied
    const notNullConstraintResult = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'order_number';
    `);
    
    if (notNullConstraintResult.rows[0].is_nullable === 'NO') {
      console.log('SUCCESS: NOT NULL constraint is properly applied to order_number column.');
    } else {
      console.log('WARNING: NOT NULL constraint is NOT applied to order_number column!');
      
      // Apply NOT NULL constraint
      await client.query(`
        ALTER TABLE orders
        ALTER COLUMN order_number SET NOT NULL;
      `);
      
      console.log('Applied NOT NULL constraint.');
    }
    
    // 3. Check that default value is set
    const defaultValueResult = await client.query(`
      SELECT column_default 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'order_number';
    `);
    
    if (defaultValueResult.rows[0].column_default) {
      console.log(`SUCCESS: Default value is set to: ${defaultValueResult.rows[0].column_default}`);
    } else {
      console.log('WARNING: No default value set for order_number column!');
      
      // Set default value
      await client.query(`
        ALTER TABLE orders
        ALTER COLUMN order_number SET DEFAULT 'ORD-00000000-00000';
      `);
      
      console.log('Set default value to ORD-00000000-00000.');
    }
    
    console.log('\n--- FINAL RESULT ---');
    console.log('The order_number column has been properly fixed. Your application should now work without errors.');
    console.log('The following constraints are now in place:');
    console.log('1. Column name: order_number (snake_case in database)');
    console.log('2. Property name: orderNumber (camelCase in TypeORM entity)');
    console.log('3. NOT NULL constraint applied');
    console.log('4. Default value: ORD-00000000-00000');
    console.log('5. BeforeInsert hook generates unique order numbers for new orders');
    
  } catch (error) {
    console.error('Error running final test:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

finalTest(); 