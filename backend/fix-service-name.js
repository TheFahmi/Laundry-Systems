const { Client } = require('pg');
require('dotenv').config();

async function fixServiceNameColumn() {
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

    // Check the column name (just to be safe)
    console.log('Checking order_items table columns...');
    const columnInfo = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'order_items';
    `);
    
    console.log('Columns in order_items table:');
    columnInfo.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });

    // Update NULL service_name values based on service_id if possible
    console.log('Updating NULL service_name values with service information...');
    
    // First try to update based on service_id
    const joinUpdateResult = await client.query(`
      UPDATE order_items oi
      SET service_name = s.name
      FROM services s
      WHERE oi.service_id = s.id
      AND oi.service_name IS NULL;
    `);
    
    console.log(`Updated ${joinUpdateResult.rowCount} records using service information`);
    
    // For any remaining NULL values, set a generic name
    const genericUpdateResult = await client.query(`
      UPDATE order_items
      SET service_name = 'Unknown Service'
      WHERE service_name IS NULL;
    `);
    
    console.log(`Updated ${genericUpdateResult.rowCount} records with generic service name`);

    // Add default constraint
    console.log('Adding default value to service_name column...');
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN service_name SET DEFAULT 'Unknown Service';
    `);

    // Set NOT NULL constraint
    console.log('Setting NOT NULL constraint for service_name column...');
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN service_name SET NOT NULL;
    `);

    console.log('Successfully fixed the service_name column');
  } catch (error) {
    console.error('Error fixing service_name column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixServiceNameColumn(); 