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

async function checkTypeOrmConfig() {
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

    // Check TypeORM entities table
    console.log('\n--- Checking TypeORM configuration tables ---');
    
    // Check if TypeORM metadata table exists
    const metadataTableQuery = `
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'typeorm_metadata'
      );
    `;
    
    const metadataTableResult = await client.query(metadataTableQuery);
    const metadataTableExists = metadataTableResult.rows[0].exists;
    
    console.log(`TypeORM metadata table exists: ${metadataTableExists}`);
    
    if (metadataTableExists) {
      // Get metadata entries
      const metadataQuery = `SELECT * FROM typeorm_metadata;`;
      const metadataResult = await client.query(metadataQuery);
      
      console.log(`\nTypeORM metadata entries: ${metadataResult.rowCount}`);
      metadataResult.rows.forEach(row => {
        console.log(row);
      });
    }
    
    // Check orders table constraints and actual structure
    const tableStructureQuery = `
      SELECT 
        tc.constraint_name, 
        tc.constraint_type, 
        kcu.column_name
      FROM 
        information_schema.table_constraints tc
      JOIN 
        information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE 
        tc.table_name = 'orders';
    `;
    
    const structureResult = await client.query(tableStructureQuery);
    
    console.log(`\nConstraints on the orders table: ${structureResult.rowCount}`);
    structureResult.rows.forEach(row => {
      console.log(`${row.constraint_type}: ${row.constraint_name} (${row.column_name})`);
    });
    
    // Get sample data to check what's in the orderNumber column
    const sampleDataQuery = `
      SELECT id, order_number 
      FROM orders 
      WHERE order_number IS NULL 
      LIMIT 5;
    `;
    
    const sampleResult = await client.query(sampleDataQuery);
    
    console.log(`\nSample orders with NULL order_number: ${sampleResult.rowCount}`);
    sampleResult.rows.forEach(row => {
      console.log(row);
    });
    
    // Try direct query to see if error occurs with specific SQL
    try {
      console.log("\nTrying direct query with 'orderNumber'...");
      await client.query("SELECT * FROM orders WHERE \"orderNumber\" IS NULL LIMIT 1;");
      console.log("Direct query with orderNumber succeeded (column exists)");
    } catch (sqlError) {
      console.log(`Direct query error: ${sqlError.message}`);
    }
    
  } catch (error) {
    console.error('Error checking TypeORM configuration:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkTypeOrmConfig(); 