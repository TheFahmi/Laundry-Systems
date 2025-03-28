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

async function fixCustomerNameColumn() {
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

    // Run the SQL to fix name column
    console.log('Updating NULL name values...');
    
    // Check if name column exists
    const columnCheckResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'customers' AND column_name = 'name';
    `);
    
    if (columnCheckResult.rowCount === 0) {
      console.log('name column does not exist in customers table');
      return;
    }
    
    // Count NULL values
    const nullCount = await client.query(`
      SELECT COUNT(*) AS count
      FROM customers
      WHERE name IS NULL;
    `);
    
    console.log(`Found ${nullCount.rows[0].count} customers with NULL name`);
    
    // Update NULL values with a default name
    if (parseInt(nullCount.rows[0].count) > 0) {
      const updateResult = await client.query(`
        UPDATE customers
        SET name = CONCAT('Customer-', id)
        WHERE name IS NULL;
      `);
      
      console.log(`Updated ${updateResult.rowCount} customers with generated names`);
    }
    
    // Set default value
    console.log('Adding default constraint to name column...');
    await client.query(`
      ALTER TABLE customers
      ALTER COLUMN name SET DEFAULT 'Unknown Customer';
    `);
    
    // Set NOT NULL constraint
    console.log('Setting NOT NULL constraint on name column...');
    await client.query(`
      ALTER TABLE customers
      ALTER COLUMN name SET NOT NULL;
    `);
    
    console.log('Successfully fixed the name column');

    // Check for other columns that might have NULL values in other tables
    console.log('\nChecking for other columns with NULL values in the database...');
    
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `);
    
    for (const tableRow of tablesResult.rows) {
      const tableName = tableRow.table_name;
      
      // Skip tables we've already fixed
      if (['payments', 'orders', 'customers'].includes(tableName)) {
        continue;
      }
      
      console.log(`\nChecking table: ${tableName}`);
      
      // Get columns for this table
      const columnsResult = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = $1
          AND is_nullable = 'YES';
      `, [tableName]);
      
      for (const columnRow of columnsResult.rows) {
        const columnName = columnRow.column_name;
        
        // Check if there are NULL values in this column
        const nullValueResult = await client.query(`
          SELECT COUNT(*) AS count
          FROM "${tableName}"
          WHERE "${columnName}" IS NULL;
        `);
        
        const nullValueCount = parseInt(nullValueResult.rows[0].count);
        
        if (nullValueCount > 0) {
          console.log(`  - Column "${columnName}" in table "${tableName}" has ${nullValueCount} NULL values`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error fixing name column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

fixCustomerNameColumn(); 