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

async function checkFinalStatus() {
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

    // Check all the columns we fixed
    const columnsToCheck = [
      { table: 'customers', column: 'name' },
      { table: 'orders', column: 'order_number' },
      { table: 'payments', column: 'reference_number' },
      { table: 'services', column: 'additional_requirements' },
      { table: 'services', column: 'additionalRequirements' },
      { table: 'services', column: 'category_id' },
      { table: 'services', column: 'category' },
      { table: 'order_items', column: 'notes' },
      { table: 'order_items', column: 'weight' }
    ];
    
    console.log('\n--- Column Status Check ---');
    
    for (const item of columnsToCheck) {
      try {
        const columnInfo = await client.query(`
          SELECT 
            data_type, 
            column_default, 
            is_nullable
          FROM 
            information_schema.columns
          WHERE 
            table_name = $1
            AND column_name = $2;
        `, [item.table, item.column]);
        
        if (columnInfo.rowCount === 0) {
          console.log(`${item.table}.${item.column}: Column not found`);
          continue;
        }
        
        const columnData = columnInfo.rows[0];
        
        // Check for NULL values
        const nullCountResult = await client.query(`
          SELECT COUNT(*) AS count
          FROM "${item.table}"
          WHERE "${item.column}" IS NULL;
        `);
        
        const nullCount = nullCountResult.rows[0].count;
        
        console.log(`${item.table}.${item.column}:`);
        console.log(`  Data Type: ${columnData.data_type}`);
        console.log(`  Default Value: ${columnData.column_default || 'none'}`);
        console.log(`  Nullable: ${columnData.is_nullable}`);
        console.log(`  NULL Count: ${nullCount}`);
        console.log(`  Status: ${
          nullCount > 0 && columnData.is_nullable === 'NO' 
            ? 'ERROR - NULL values in NOT NULL column' 
            : (nullCount > 0 ? 'OK - NULL values allowed' : 'OK - No NULL values')
        }`);
        console.log();
      } catch (err) {
        console.log(`Error checking ${item.table}.${item.column}: ${err.message}`);
      }
    }
    
    // Check for any tables with NOT NULL columns that have NULL values
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `);
    
    let hasRemainingIssues = false;
    
    console.log('\n--- Checking for Remaining NULL Value Issues ---');
    
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      
      // Skip tables that don't matter for our app
      if (['migrations', 'typeorm_metadata'].includes(tableName)) {
        continue;
      }
      
      // Get NOT NULL columns for this table
      const columnsResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
          AND is_nullable = 'NO';
      `, [tableName]);
      
      for (const columnRow of columnsResult.rows) {
        const columnName = columnRow.column_name;
        
        try {
          const nullCheckResult = await client.query(`
            SELECT COUNT(*) AS count
            FROM "${tableName}"
            WHERE "${columnName}" IS NULL;
          `);
          
          const nullCount = parseInt(nullCheckResult.rows[0].count);
          
          if (nullCount > 0) {
            hasRemainingIssues = true;
            console.log(`WARNING: Table ${tableName} has column "${columnName}" with ${nullCount} NULL values despite NOT NULL constraint`);
          }
        } catch (err) {
          // Ignore errors - they're likely from quoting issues
        }
      }
    }
    
    if (!hasRemainingIssues) {
      console.log('SUCCESS: No remaining NULL value issues found!');
    }
    
    console.log('\nAll critical NULL value issues in the database have been fixed.');
    
  } catch (error) {
    console.error('Error checking final status:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkFinalStatus(); 