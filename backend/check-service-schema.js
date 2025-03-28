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

async function checkServiceSchema() {
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

    // Check "services" table schema with detailed column information
    console.log('\n--- Services Table Schema ---');
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
        table_name = 'services'
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

    // Examine sample data of the services table
    console.log('\n--- Sample Services Data ---');
    const sampleResult = await client.query(`
      SELECT * FROM services LIMIT 2;
    `);
    
    sampleResult.rows.forEach((row, index) => {
      console.log(`\nService ${index + 1}:`);
      for (const [key, value] of Object.entries(row)) {
        console.log(`  ${key}: ${value === null ? 'NULL' : (typeof value === 'object' ? JSON.stringify(value) : value)}`);
      }
    });
    
  } catch (error) {
    console.error('Error checking service schema:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

checkServiceSchema(); 