import { Client } from 'pg';

async function fixOrderNumberColumn() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '@Gatauu123',
    database: 'laundry_db'
  });

  try {
    await client.connect();
    
    // Drop existing columns if they exist
    await client.query(`
      ALTER TABLE orders 
      DROP COLUMN IF EXISTS order_number,
      DROP COLUMN IF EXISTS "orderNumber";
    `);
    
    // Add the correct column
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN order_number VARCHAR(50) UNIQUE;
    `);
    
    console.log('Order number column fixed successfully');
  } catch (err) {
    console.error('Error fixing order number column:', err);
  } finally {
    await client.end();
  }
}

fixOrderNumberColumn(); 