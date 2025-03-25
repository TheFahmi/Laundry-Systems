import { Client } from 'pg';

async function addOrderNumberColumn() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '@Gatauu123',
    database: 'laundry_db'
  });

  try {
    await client.connect();
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE;
    `);
    console.log('Order number column added successfully');
  } catch (err) {
    console.error('Error adding order number column:', err);
  } finally {
    await client.end();
  }
}

addOrderNumberColumn(); 