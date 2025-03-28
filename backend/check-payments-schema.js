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

async function checkPaymentsSchema() {
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

    // Check "payments" table schema with detailed column information
    console.log('\n--- Payments Table Schema ---');
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
        table_name = 'payments'
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

    // Check specifically for reference_number constraints
    console.log('\n--- Reference Number Column Details ---');
    const refNumResult = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length, 
        column_default, 
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_name = 'payments' AND
        column_name = 'reference_number';
    `);
    
    if (refNumResult.rowCount > 0) {
      const refNumColumn = refNumResult.rows[0];
      console.log(`Column Name: ${refNumColumn.column_name}`);
      console.log(`Data Type: ${refNumColumn.data_type}${refNumColumn.character_maximum_length ? `(${refNumColumn.character_maximum_length})` : ''}`);
      console.log(`Default Value: ${refNumColumn.column_default || 'none'}`);
      console.log(`Nullable: ${refNumColumn.is_nullable}`);
    } else {
      console.log('reference_number column not found in payments table');
    }

    // Check for records in the payments table
    const countResult = await client.query('SELECT COUNT(*) FROM payments');
    console.log(`\nTotal Payments: ${countResult.rows[0].count}`);
    
    // Check for any NULL reference_number values
    const nullCountResult = await client.query('SELECT COUNT(*) FROM payments WHERE reference_number IS NULL');
    console.log(`Payments with NULL reference_number: ${nullCountResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking payments schema:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkPaymentsSchema(); 