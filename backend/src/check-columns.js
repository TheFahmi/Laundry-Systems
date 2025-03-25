const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
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

    // Get list of tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    // Check each table for camelCase columns vs snake_case
    console.log('Checking tables for column naming inconsistencies...');
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Skip migrations table
      if (tableName === 'migrations') {
        continue;
      }
      
      console.log(`\nTable: ${tableName}`);
      
      // Get all columns for this table
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position;
      `);
      
      console.log('Columns:');
      let camelCaseCount = 0;
      let snakeCaseCount = 0;
      
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
        
        // Check if column name is camelCase or snake_case
        if (col.column_name.includes('_')) {
          snakeCaseCount++;
        } else if (/[a-z][A-Z]/.test(col.column_name)) {
          camelCaseCount++;
        }
      });
      
      // Report on naming convention
      if (camelCaseCount > 0 && snakeCaseCount > 0) {
        console.log(`WARNING: Mixed naming convention in ${tableName} table: ${camelCaseCount} camelCase, ${snakeCaseCount} snake_case`);
      } else if (camelCaseCount > 0) {
        console.log(`Info: ${tableName} table uses camelCase naming convention`);
      } else if (snakeCaseCount > 0) {
        console.log(`Info: ${tableName} table uses snake_case naming convention`);
      }
      
      // Check specifically for createdAt/updatedAt vs created_at/updated_at
      const timestampCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${tableName}' 
        AND column_name IN ('createdAt', 'updatedAt', 'created_at', 'updated_at')
      `);
      
      if (timestampCheck.rows.length > 0) {
        console.log('Timestamp columns:');
        timestampCheck.rows.forEach(col => {
          console.log(`- ${col.column_name}`);
        });
        
        // Check for mixed timestamp naming
        const hasCreatedAt = timestampCheck.rows.some(col => col.column_name === 'createdAt');
        const hasCreated_at = timestampCheck.rows.some(col => col.column_name === 'created_at');
        const hasUpdatedAt = timestampCheck.rows.some(col => col.column_name === 'updatedAt');
        const hasUpdated_at = timestampCheck.rows.some(col => col.column_name === 'updated_at');
        
        if ((hasCreatedAt && hasCreated_at) || (hasUpdatedAt && hasUpdated_at)) {
          console.log(`ERROR: Mixed timestamp naming in ${tableName} table!`);
        } else if (hasCreatedAt || hasUpdatedAt) {
          console.log(`WARNING: ${tableName} table has camelCase timestamp columns that should be converted to snake_case`);
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

checkColumns().catch(console.error); 