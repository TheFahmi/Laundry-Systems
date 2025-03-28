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

async function checkOrdersSchema() {
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

    // Check "orders" table schema with detailed column information
    console.log('\n--- Orders Table Schema ---');
    const schemaResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length, 
        column_default, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'orders'
      ORDER BY 
        ordinal_position;
    `);
    
    // Display column details
    schemaResult.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''})`);
      console.log(`  Default: ${row.column_default || 'none'}`);
      console.log(`  Nullable: ${row.is_nullable}`);
      console.log();
    });

    // Check specifically for order_number constraints
    console.log('\n--- Order Number Column Details ---');
    const orderNumResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length, 
        column_default, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'orders' AND
        column_name = 'order_number';
    `);
    
    if (orderNumResult.rowCount > 0) {
      const orderNumColumn = orderNumResult.rows[0];
      console.log(`Column Name: ${orderNumColumn.column_name}`);
      console.log(`Data Type: ${orderNumColumn.data_type}${orderNumColumn.character_maximum_length ? `(${orderNumColumn.character_maximum_length})` : ''}`);
      console.log(`Default Value: ${orderNumColumn.column_default || 'none'}`);
      console.log(`Nullable: ${orderNumColumn.is_nullable}`);
    } else {
      console.log('order_number column not found in orders table');
    }

    // Check for records in the orders table
    const countResult = await client.query('SELECT COUNT(*) FROM orders');
    console.log(`\nTotal Orders: ${countResult.rows[0].count}`);
    
    // Check for any NULL order_number values
    const nullCountResult = await client.query('SELECT COUNT(*) FROM orders WHERE order_number IS NULL');
    console.log(`Orders with NULL order_number: ${nullCountResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking orders schema:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkOrdersSchema(); 