const { Client } = require('pg');
require('dotenv').config();

async function fixPriceModelColumn() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // First, check the column name
    console.log('Checking column names in the services table...');
    const columnInfo = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'services';
    `);
    
    console.log('Columns in services table:');
    columnInfo.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });

    // Find the price model column (case-insensitive match)
    const priceModelColumn = columnInfo.rows.find(
      row => row.column_name.toLowerCase() === 'pricemodel'
    );

    if (!priceModelColumn) {
      throw new Error('Price model column not found in services table');
    }

    const actualColumnName = priceModelColumn.column_name;
    console.log(`Found price model column: "${actualColumnName}"`);

    // First, add default constraint
    console.log(`Adding default constraint to ${actualColumnName} column...`);
    await client.query(`
      ALTER TABLE services 
      ALTER COLUMN "${actualColumnName}" SET DEFAULT 'per_kg';
    `);

    // Update existing NULL values
    console.log(`Updating NULL values in ${actualColumnName} column...`);
    const updateResult = await client.query(`
      UPDATE services
      SET "${actualColumnName}" = 'per_kg'
      WHERE "${actualColumnName}" IS NULL;
    `);
    console.log(`Updated ${updateResult.rowCount} rows with NULL ${actualColumnName} values`);

    // Set NOT NULL constraint
    console.log(`Setting NOT NULL constraint to ${actualColumnName} column...`);
    await client.query(`
      ALTER TABLE services 
      ALTER COLUMN "${actualColumnName}" SET NOT NULL;
    `);

    console.log(`Successfully updated the ${actualColumnName} column`);
  } catch (error) {
    console.error('Error fixing price model column:', error);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixPriceModelColumn(); 